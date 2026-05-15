import { describe, it, expect, vi } from "vitest";
import { removeHandler } from "./remove";

const tasks = [
  { id: 1, title: 'Task One', priority: 'high' as const, done: false },
  { id: 2, title: 'Task Two', priority: 'low' as const, done: true },
  { id: 3, title: 'Task Three', priority: 'high' as const, done: false },
];

describe('remove command', () => {
  it('deletes the given task', async () => {
    const log = vi.fn();
    const saveTasks = vi.fn();

    await removeHandler("1", {
      loadTasks: async () => tasks,
      saveTasks,
      log
    });

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toContain('Removed task 1');

    const saved = saveTasks.mock.calls[0][0];

    expect(saved.length).toBeLessThan(tasks.length);
    expect(saved).not.toContain("Task One");
  });

  it('exits with error when task not found', async () => {
    const saveTasks = vi.fn();
    const log = vi.fn();
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await removeHandler("999", {
      loadTasks: async () => tasks,
      saveTasks,
      log
    });

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(saveTasks).not.toHaveBeenCalled();

    processExitSpy.mockRestore();
  });
});