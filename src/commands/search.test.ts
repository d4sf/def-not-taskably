import { describe, expect, it, vi } from "vitest";
import { searchHandler } from "./search.js";

const tasks = [
  { id: 169999991, title: "Task One", description: "", priority: "high" as const, done: false },
  { id: 169999992, title: "Task Two", description: "", priority: "low" as const, done: true },
  { id: 169999993, title: "Task Three", description: "", priority: "high" as const, done: false },
  { id: 169999994, title: "Buy Milk", description: "", priority: "medium" as const, done: false },
];

describe("search command", () => {
  it("searches by title (case-insensitive) by default", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "task" },
      {
        loadTasks: async () => tasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledTimes(3);
    expect(log.mock.calls[0][0]).toContain("Task One");
    expect(log.mock.calls[1][0]).toContain("Task Two");
    expect(log.mock.calls[2][0]).toContain("Task Three");
  });

  it("searches by title with -t flag", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "buy", title: true },
      {
        loadTasks: async () => tasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toContain("Buy Milk");
  });

  it("searches case-sensitive with -c flag", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "task", title: true, caseSensitive: true },
      {
        loadTasks: async () => tasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith("No tasks found.");
  });

  it("searches case-sensitive with -c flag finds matches", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "Task", title: true, caseSensitive: true },
      {
        loadTasks: async () => tasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledTimes(3);
  });

  it("searches by id with -i flag (partial match)", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "99992", id: true },
      {
        loadTasks: async () => tasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toContain("169999992");
  });

  it("searches by priority with -p flag", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "", priority: "high" },
      {
        loadTasks: async () => tasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[0][0]).toContain("high");
  });

  it("combines title and priority search", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "task", title: true, priority: "high" },
      {
        loadTasks: async () => tasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[0][0]).toContain("Task One");
    expect(log.mock.calls[1][0]).toContain("Task Three");
  });

  it("errors when -i is combined with -t or -p", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "1", id: true, title: true },
      {
        loadTasks: async () => tasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledWith("Error: -i flag cannot be combined with -t or -p");
  });

  it("searches by description text (default search)", async () => {
    const log = vi.fn();
    const tasksWithDesc = [
      {
        id: 1,
        title: "Chore",
        description: "buy groceries",
        priority: "low" as const,
        done: false,
      },
      {
        id: 2,
        title: "Errand",
        description: "pick up dry cleaning",
        priority: "medium" as const,
        done: false,
      },
    ];

    await searchHandler(
      { query: "groceries" },
      {
        loadTasks: async () => tasksWithDesc,
        log,
      },
    );

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toContain("buy groceries");
  });

  it("searches by description case-insensitively", async () => {
    const log = vi.fn();
    const tasksWithDesc = [
      {
        id: 1,
        title: "Chore",
        description: "Buy Groceries",
        priority: "low" as const,
        done: false,
      },
    ];

    await searchHandler(
      { query: "groceries" },
      {
        loadTasks: async () => tasksWithDesc,
        log,
      },
    );

    expect(log).toHaveBeenCalledTimes(1);
  });

  it("shows message when no tasks found", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "nonexistent" },
      {
        loadTasks: async () => tasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith("No tasks found.");
  });

  it("searches by id when only -i flag is provided (no query needed)", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "", id: true },
      {
        loadTasks: async () => tasks,
        log,
      },
    );

    expect(log).toHaveBeenCalledTimes(4);
  });
});
