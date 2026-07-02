import { describe, expect, it, vi } from "vitest";
import type { Task } from "../types.js";
import { undoneHandler } from "./undone.js";

const tasks = [
  { id: 1, title: "Task One", priority: "high" as const, done: false },
  { id: 2, title: "Task Two", priority: "low" as const, done: true },
  { id: 3, title: "Task Three", priority: "high" as const, done: false },
];

describe("undone command", () => {
  it("mark the given task as not done", async () => {
    const log = vi.fn();
    const saveTasks = vi.fn();

    await undoneHandler("2", {
      loadTasks: async () => tasks,
      saveTasks,
      log,
    });

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toContain("Marked as not done: Task Two");

    const saved = saveTasks.mock.calls[0][0];
    const updated = saved.find((t: Task) => t.id === 2);

    expect(updated.done).toBe(false);
  });

  it("exits with error when task not found", async () => {
    const saveTasks = vi.fn();
    const log = vi.fn();
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    await undoneHandler("999", {
      loadTasks: async () => tasks,
      saveTasks,
      log,
    });

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(saveTasks).not.toHaveBeenCalled();

    processExitSpy.mockRestore();
  });

  it("handles task already marked as not done", async () => {
    const log = vi.fn();
    const saveTasks = vi.fn();

    await undoneHandler("1", {
      loadTasks: async () => tasks,
      saveTasks,
      log,
    });

    expect(saveTasks).toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("Marked as not done: Task One");
  });
});
