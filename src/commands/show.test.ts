import { describe, expect, it, vi } from "vitest";
import { showHandler } from "./show.js";

const tasks = [
  {
    id: 1,
    title: "Task One",
    description: "A description",
    priority: "high" as const,
    done: false,
  },
  { id: 2, title: "Task Two", description: "", priority: "low" as const, done: true },
];

describe("show command", () => {
  it("displays all task fields", async () => {
    const log = vi.fn();

    await showHandler("1", {
      loadTasks: async () => tasks,
      log,
    });

    expect(log).toHaveBeenCalledTimes(5);
    expect(log.mock.calls[0][0]).toBe("ID: 1");
    expect(log.mock.calls[1][0]).toBe("Title: Task One");
    expect(log.mock.calls[2][0]).toBe("Description: A description");
    expect(log.mock.calls[3][0]).toBe("Priority: high");
    expect(log.mock.calls[4][0]).toBe("Done: No");
  });

  it("displays (none) when description is empty", async () => {
    const log = vi.fn();

    await showHandler("2", {
      loadTasks: async () => tasks,
      log,
    });

    expect(log.mock.calls[2][0]).toBe("Description: (none)");
  });

  it("shows Yes when task is done", async () => {
    const log = vi.fn();

    await showHandler("2", {
      loadTasks: async () => tasks,
      log,
    });

    expect(log.mock.calls[4][0]).toBe("Done: Yes");
  });

  it("exits with error when task not found", async () => {
    const log = vi.fn();
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    await showHandler("999", {
      loadTasks: async () => tasks,
      log,
    });

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(log).not.toHaveBeenCalled();

    processExitSpy.mockRestore();
  });
});
