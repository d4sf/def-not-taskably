import { describe, it, expect, vi } from "vitest";
import { listHandler } from "./list.js";

const tasks = [
  { id: 1, title: 'Task One', priority: 'high' as const, done: false },
  { id: 2, title: 'Task Two', priority: 'low' as const, done: true },
  { id: 3, title: 'Task Three', priority: 'high' as const, done: false },
];

describe('list command', () => {
  it('lists incomplete tasks by default', async () => {
    const log = vi.fn();

    await listHandler({}, {
      loadTasks: async () => tasks,
      log
    });

    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[0][0]).toContain('Task One');
    expect(log.mock.calls[1][0]).toContain('Task Three');
    expect(log.mock.calls[0][0]).toContain('[ ]');
  });

  it('lists all tasks when all option is true', async () => {
    const log = vi.fn();

    await listHandler({ all: true }, {
      loadTasks: async () => tasks,
      log
    });

    expect(log).toHaveBeenCalledTimes(3);
    expect(log.mock.calls[0][0]).toContain('Task One');
    expect(log.mock.calls[1][0]).toContain('Task Two');
    expect(log.mock.calls[1][0]).toContain('[x]');
  });

  it('filters tasks by priority', async () => {
    const log = vi.fn();

    await listHandler({ priority: 'high' }, {
      loadTasks: async () => tasks,
      log
    });

    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[0][0]).toContain('high');
  });

  it('shows message when no tasks found', async () => {
    const log = vi.fn();

    await listHandler({ priority: 'medium' }, {
      loadTasks: async () => tasks,
      log
    });

    expect(log).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith('No tasks found.');
  });
});