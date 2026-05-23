import { describe, it, expect, vi } from "vitest";
import { addHandler } from "./add.js";

describe('add command', () => {
  it('appends a new task with the given priority', async () => {
    const existing = [{ id: 1, title: 'old', description: '', priority: 'low' as const, done: false }];
    const saveTasks = vi.fn();
    const log = vi.fn();

    await addHandler('new task', { priority: 'high' }, {
      loadTasks: async () => existing,
      saveTasks,
      log
    });

    expect(saveTasks).toHaveBeenCalledOnce();

    const saved = saveTasks.mock.calls[0][0]

    expect(saved).toHaveLength(2);
    expect(saved[1].title).toBe('new task');
    expect(saved[1].priority).toBe('high');
    expect(log).toHaveBeenCalledWith('Added: new task');
  });

  it('appends a new task with a description', async () => {
    const existing = [{ id: 1, title: 'old', description: '', priority: 'low' as const, done: false }];
    const saveTasks = vi.fn();
    const log = vi.fn();

    await addHandler('new task', { priority: 'high', description: 'a detailed task' }, {
      loadTasks: async () => existing,
      saveTasks,
      log
    });

    expect(saveTasks).toHaveBeenCalledOnce();

    const saved = saveTasks.mock.calls[0][0]

    expect(saved[1].description).toBe('a detailed task');
    expect(log).toHaveBeenCalledWith('Added: new task');
  });
});