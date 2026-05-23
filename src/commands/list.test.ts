import { describe, it, expect, vi } from "vitest";
import { listHandler } from "./list.js";

const tasks = [
  { id: 1, title: 'Task One', description: '', priority: 'high' as const, done: false },
  { id: 2, title: 'Task Two', description: '', priority: 'low' as const, done: true },
  { id: 3, title: 'Task Three', description: '', priority: 'high' as const, done: false },
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

  it('displays truncated description on second line', async () => {
    const log = vi.fn();
    const tasksWithDesc = [
      { id: 1, title: 'Task One', description: 'a short desc', priority: 'high' as const, done: false },
      { id: 4, title: 'Long desc task', description: 'a'.repeat(50), priority: 'low' as const, done: false },
    ];

    await listHandler({ all: true }, {
      loadTasks: async () => tasksWithDesc,
      log
    });

    expect(log).toHaveBeenCalledTimes(4);
    expect(log.mock.calls[0][0]).toContain('Task One');
    expect(log.mock.calls[1][0]).toContain('a short desc');
    expect(log.mock.calls[2][0]).toContain('Long desc task');
    expect(log.mock.calls[3][0]).toContain('...');
    expect(log.mock.calls[3][0].length).toBeLessThanOrEqual(43);
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