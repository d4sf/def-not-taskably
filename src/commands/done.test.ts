import { describe, it, vi, expect } from "vitest";
import { doneHandler } from "./done.js";

const tasks = [
  { id: 1, title: 'Task One', priority: 'high' as const, done: false },
  { id: 2, title: 'Task Two', priority: 'low' as const, done: true },
  { id: 3, title: 'Task Three', priority: 'high' as const, done: false },
];

describe('done command', () => {
  it('mark the given task as done', async () => {
    const log = vi.fn();
    const saveTasks = vi.fn();

    await doneHandler("1", {
      loadTasks: async () => tasks,
      saveTasks,
      log
    });

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toContain('Marked as done: Task One');

    const saved = saveTasks.mock.calls[0][0];
    const updated = saved.find (t => t.id === 1);

    expect (updated.done).toBe(true);
  });

  it('exits with error when task not found', async () => {
    const saveTasks = vi.fn();
    const log = vi.fn()
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await doneHandler("999", {
      loadTasks: async () => tasks,
      saveTasks,
      log
    });

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(saveTasks).not.toHaveBeenCalled();
    
    processExitSpy.mockRestore();
  });

  it('handles task already marked as done', async () => {
    const log = vi.fn();
    const saveTasks = vi.fn();

    await doneHandler("2", {
      loadTasks: async () => tasks,
      saveTasks,
      log
    });

    expect(saveTasks).toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('Marked as done: Task Two');
  });
});