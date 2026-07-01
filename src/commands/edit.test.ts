import { describe, expect, it, vi } from "vitest";
import type { Task } from "../types.js";
import { editHandler } from "./edit.js";

const tasks = [
  { id: 1, title: "Task One", description: "", priority: "high" as const, done: false },
  { id: 2, title: "Task Two", description: "", priority: "low" as const, done: true },
  { id: 3, title: "Task Three", description: "", priority: "high" as const, done: false },
];

describe("edit command", () => {
  it("edit task title", async () => {
    const log = vi.fn();
    const saveTasks = vi.fn();

    await editHandler(
      "1",
      { title: "Updated Task One" },
      {
        loadTasks: async () => tasks,
        saveTasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toContain("Updated title for task 1");

    const saved = saveTasks.mock.calls[0][0];
    const updated = saved.find((t: Task) => t.id === 1);

    expect(updated.title).toBe("Updated Task One");
    expect(updated.priority).toBe("high");
  });

  it("edit task priority", async () => {
    const log = vi.fn();
    const saveTasks = vi.fn();

    await editHandler(
      "2",
      { priority: "high" as const },
      {
        loadTasks: async () => tasks,
        saveTasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toContain("Updated priority for task 2");

    const saved = saveTasks.mock.calls[0][0];
    const updated = saved.find((t: Task) => t.id === 2);

    expect(updated.priority).toBe("high");
    expect(updated.title).toBe("Task Two");
  });

  it("edit both title and priority", async () => {
    const log = vi.fn();
    const saveTasks = vi.fn();

    await editHandler(
      "3",
      { title: "Updated Task Three", priority: "low" as const },
      {
        loadTasks: async () => tasks,
        saveTasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toContain("Updated title and priority for task 3");

    const saved = saveTasks.mock.calls[0][0];
    const updated = saved.find((t: Task) => t.id === 3);

    expect(updated.title).toBe("Updated Task Three");
    expect(updated.priority).toBe("low");
  });

  it("exits with error when task not found", async () => {
    const saveTasks = vi.fn();
    const log = vi.fn();
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    await editHandler(
      "999",
      { title: "New Title" },
      {
        loadTasks: async () => tasks,
        saveTasks,
        log,
      },
    );

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(saveTasks).not.toHaveBeenCalled();

    processExitSpy.mockRestore();
  });

  it("edit task description", async () => {
    const log = vi.fn();
    const saveTasks = vi.fn();

    await editHandler(
      "1",
      { description: "New description" },
      {
        loadTasks: async () => tasks,
        saveTasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toContain("Updated description for task 1");

    const saved = saveTasks.mock.calls[0][0];
    const updated = saved.find((t: Task) => t.id === 1);

    expect(updated.description).toBe("New description");
  });

  it("edit both description and priority", async () => {
    const log = vi.fn();
    const saveTasks = vi.fn();

    await editHandler(
      "3",
      { description: "Updated desc", priority: "low" as const },
      {
        loadTasks: async () => tasks,
        saveTasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toContain("Updated description and priority for task 3");
  });

  it("exits with error when description is empty", async () => {
    const saveTasks = vi.fn();
    const log = vi.fn();
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    await editHandler(
      "1",
      { description: "   " },
      {
        loadTasks: async () => tasks,
        saveTasks,
        log,
      },
    );

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(saveTasks).not.toHaveBeenCalled();

    processExitSpy.mockRestore();
  });

  it("exits with error when no options provided", async () => {
    const saveTasks = vi.fn();
    const log = vi.fn();
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    await editHandler(
      "1",
      {},
      {
        loadTasks: async () => tasks,
        saveTasks,
        log,
      },
    );

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(saveTasks).not.toHaveBeenCalled();

    processExitSpy.mockRestore();
  });

  it("exits with error when title is empty", async () => {
    const saveTasks = vi.fn();
    const log = vi.fn();
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    await editHandler(
      "1",
      { title: "   " },
      {
        loadTasks: async () => tasks,
        saveTasks,
        log,
      },
    );

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(saveTasks).not.toHaveBeenCalled();

    processExitSpy.mockRestore();
  });
});
