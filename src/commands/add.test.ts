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
      log,
      inputPrompt: vi.fn(),
      selectPrompt: vi.fn()
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
      log,
      inputPrompt: vi.fn(),
      selectPrompt: vi.fn()
    });

    expect(saveTasks).toHaveBeenCalledOnce();

    const saved = saveTasks.mock.calls[0][0]

    expect(saved[1].description).toBe('a detailed task');
    expect(log).toHaveBeenCalledWith('Added: new task - a detailed task');
  });

  it('appends a new task with default priority medium when not provided', async () => {
    const existing = [{ id: 1, title: 'old', description: '', priority: 'low' as const, done: false }];
    const saveTasks = vi.fn();
    const log = vi.fn();

    await addHandler('new task', {}, {
      loadTasks: async () => existing,
      saveTasks,
      log,
      inputPrompt: vi.fn(),
      selectPrompt: vi.fn()
    });

    expect(saveTasks).toHaveBeenCalledOnce();

    const saved = saveTasks.mock.calls[0][0]

    expect(saved).toHaveLength(2);
    expect(saved[1].title).toBe('new task');
    expect(saved[1].priority).toBe('medium');
    expect(saved[1].description).toBe('');
    expect(log).toHaveBeenCalledWith('Added: new task');
  });

  it('uses interactive prompts when title is not provided', async () => {
    const existing = [{ id: 1, title: 'old', description: '', priority: 'low' as const, done: false }];
    const saveTasks = vi.fn();
    const log = vi.fn();

    const inputPrompt = vi.fn()
      .mockResolvedValueOnce('Prompted Title')
      .mockResolvedValueOnce('Prompted Desc');

    const selectPrompt = vi.fn()
      .mockResolvedValueOnce('high' as const);

    await addHandler(undefined, {}, {
      loadTasks: async () => existing,
      saveTasks,
      log,
      inputPrompt,
      selectPrompt
    });

    expect(inputPrompt).toHaveBeenCalledTimes(2);
    expect(selectPrompt).toHaveBeenCalledTimes(1);

    expect(saveTasks).toHaveBeenCalledOnce();
    const saved = saveTasks.mock.calls[0][0];

    expect(saved).toHaveLength(2);
    expect(saved[1].title).toBe('Prompted Title');
    expect(saved[1].description).toBe('Prompted Desc');
    expect(saved[1].priority).toBe('high');
    expect(saved[1].done).toBe(false);
    expect(typeof saved[1].id).toBe('number');

    expect(log).toHaveBeenCalledWith('Added: Prompted Title - Prompted Desc');
  });
});