import { describe, expect, it, vi } from "vitest";
import { addHandler } from "./add.js";

describe("addHandler", () => {
  it("creates a ticket with given title and default values", async () => {
    const saveTickets = vi.fn();
    const log = vi.fn();

    await addHandler(
      "my ticket",
      {},
      {
        loadTickets: async () => [],
        saveTickets,
        log,
        inputPrompt: vi.fn(),
        selectPrompt: vi.fn(),
      },
    );

    expect(saveTickets).toHaveBeenCalledOnce();
    const saved = saveTickets.mock.calls[0][0];
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe("my ticket");
    expect(saved[0].status).toBe("todo");
    expect(saved[0].priority).toBe("medium");
    expect(saved[0].dueby).toBeNull();
    expect(saved[0].description).toBe("");
    expect(typeof saved[0].id).toBe("number");
    expect(log).toHaveBeenCalledWith("Added: my ticket");
  });

  it("creates a ticket with all options provided", async () => {
    const saveTickets = vi.fn();

    await addHandler(
      "bug fix",
      {
        priority: "high",
        status: "in_progress",
        description: "fix the thing",
        dueby: "2026-07-15T12:00:00.000Z",
      },
      {
        loadTickets: async () => [],
        saveTickets,
        log: vi.fn(),
        inputPrompt: vi.fn(),
        selectPrompt: vi.fn(),
      },
    );

    const saved = saveTickets.mock.calls[0][0];
    expect(saved[0].title).toBe("bug fix");
    expect(saved[0].priority).toBe("high");
    expect(saved[0].status).toBe("in_progress");
    expect(saved[0].description).toBe("fix the thing");
    expect(saved[0].dueby).toBe("2026-07-15T12:00:00.000Z");
  });

  it("uses interactive prompts when title is not provided", async () => {
    const saveTickets = vi.fn();
    const inputPrompt = vi.fn().mockResolvedValueOnce("Prompted Title");
    const selectPrompt = vi.fn().mockResolvedValueOnce("high");

    await addHandler(
      undefined,
      {},
      {
        loadTickets: async () => [],
        saveTickets,
        log: vi.fn(),
        inputPrompt,
        selectPrompt,
      },
    );

    expect(inputPrompt).toHaveBeenCalledTimes(1);
    expect(selectPrompt).toHaveBeenCalledTimes(1);

    const saved = saveTickets.mock.calls[0][0];
    expect(saved[0].title).toBe("Prompted Title");
    expect(saved[0].priority).toBe("high");
  });

  it("appends to existing tickets", async () => {
    const existing = [
      {
        id: 1,
        title: "old",
        description: "",
        status: "todo" as const,
        priority: "low" as const,
        dueby: null,
      },
    ];
    const saveTickets = vi.fn();

    await addHandler(
      "second",
      { priority: "high" },
      {
        loadTickets: async () => existing,
        saveTickets,
        log: vi.fn(),
        inputPrompt: vi.fn(),
        selectPrompt: vi.fn(),
      },
    );

    const saved = saveTickets.mock.calls[0][0];
    expect(saved).toHaveLength(2);
    expect(saved[1].title).toBe("second");
  });
});
