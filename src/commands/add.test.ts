import { describe, expect, it, vi } from "vitest";
import { addHandler } from "./add.js";

describe("addHandler", () => {
  it("creates a ticket with given title and default values", async () => {
    const addTicket = vi.fn();
    const log = vi.fn();

    await addHandler(
      "my ticket",
      {},
      {
        getTickets: () => [],
        getTicketById: vi.fn(),
        addTicket,
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        log,
        inputPrompt: vi.fn(),
        selectPrompt: vi.fn(),
        datePrompt: vi.fn(),
      },
    );

    expect(addTicket).toHaveBeenCalledOnce();
    const saved = addTicket.mock.calls[0][0];
    expect(saved.title).toBe("my ticket");
    expect(saved.status).toBe("todo");
    expect(saved.priority).toBe("medium");
    expect(saved.dueby).toBeNull();
    expect(saved.description).toBe("");
    expect(typeof saved.id).toBe("number");
    expect(log).toHaveBeenCalledWith("Added: my ticket");
  });

  it("creates a ticket with all options provided", async () => {
    const addTicket = vi.fn();

    await addHandler(
      "bug fix",
      {
        priority: "high",
        status: "in_progress",
        description: "fix the thing",
        dueby: "2026-07-15T12:00:00.000Z",
      },
      {
        getTickets: () => [],
        getTicketById: vi.fn(),
        addTicket,
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        log: vi.fn(),
        inputPrompt: vi.fn(),
        selectPrompt: vi.fn(),
        datePrompt: vi.fn(),
      },
    );

    const saved = addTicket.mock.calls[0][0];
    expect(saved.title).toBe("bug fix");
    expect(saved.priority).toBe("high");
    expect(saved.status).toBe("in_progress");
    expect(saved.description).toBe("fix the thing");
    expect(saved.dueby).toBe("2026-07-15T12:00:00.000Z");
  });

  it("uses interactive prompts when title is not provided", async () => {
    const addTicket = vi.fn();
    const inputPrompt = vi.fn().mockResolvedValueOnce("Prompted Title");
    const selectPrompt = vi.fn().mockResolvedValueOnce("high");

    await addHandler(
      undefined,
      {},
      {
        getTickets: () => [],
        getTicketById: vi.fn(),
        addTicket,
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        log: vi.fn(),
        inputPrompt,
        selectPrompt,
        datePrompt: vi.fn(),
      },
    );

    expect(inputPrompt).toHaveBeenCalledTimes(1);
    expect(selectPrompt).toHaveBeenCalledTimes(1);

    const saved = addTicket.mock.calls[0][0];
    expect(saved.title).toBe("Prompted Title");
    expect(saved.priority).toBe("high");
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
    const addTicket = vi.fn();

    await addHandler(
      "second",
      { priority: "high" },
      {
        getTickets: () => existing,
        getTicketById: vi.fn(),
        addTicket,
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        log: vi.fn(),
        inputPrompt: vi.fn(),
        selectPrompt: vi.fn(),
        datePrompt: vi.fn(),
      },
    );

    const saved = addTicket.mock.calls[0][0];
    expect(saved.title).toBe("second");
  });

  it("prompts for dueby in interactive mode", async () => {
    const addTicket = vi.fn();
    const inputPrompt = vi.fn().mockResolvedValueOnce("My Ticket");
    const selectPrompt = vi.fn().mockResolvedValueOnce("medium");
    const datePrompt = vi.fn().mockResolvedValueOnce(new Date("2026-07-15T12:00:00.000Z"));

    await addHandler(
      undefined,
      {},
      {
        getTickets: () => [],
        getTicketById: vi.fn(),
        addTicket,
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        log: vi.fn(),
        inputPrompt,
        selectPrompt,
        datePrompt,
      },
    );

    expect(datePrompt).toHaveBeenCalledTimes(1);
    const saved = addTicket.mock.calls[0][0];
    expect(saved.dueby).toBe("2026-07-15T12:00:00.000Z");
  });

  it("skips dueby when user cancels date prompt", async () => {
    const addTicket = vi.fn();
    const inputPrompt = vi.fn().mockResolvedValueOnce("My Ticket");
    const selectPrompt = vi.fn().mockResolvedValueOnce("medium");
    const datePrompt = vi.fn().mockResolvedValueOnce(undefined);

    await addHandler(
      undefined,
      {},
      {
        getTickets: () => [],
        getTicketById: vi.fn(),
        addTicket,
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        log: vi.fn(),
        inputPrompt,
        selectPrompt,
        datePrompt,
      },
    );

    const saved = addTicket.mock.calls[0][0];
    expect(saved.dueby).toBeNull();
  });
});
