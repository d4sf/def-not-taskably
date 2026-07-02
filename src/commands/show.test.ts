import { describe, expect, it, vi } from "vitest";
import { showHandler } from "./show.js";

describe("showHandler", () => {
  it("displays full ticket details", async () => {
    const log = vi.fn();
    const tickets = [
      {
        id: 42,
        title: "Test Ticket",
        description: "A test",
        status: "in_progress" as const,
        priority: "high" as const,
        dueby: "2026-07-15T12:00:00.000Z",
      },
    ];

    await showHandler("42", { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith("ID: 42");
    expect(log).toHaveBeenCalledWith("Title: Test Ticket");
    expect(log).toHaveBeenCalledWith("Description: A test");
    expect(log).toHaveBeenCalledWith("Status: in_progress");
    expect(log).toHaveBeenCalledWith("Priority: high");
    expect(log).toHaveBeenCalledWith("Due: 2026-07-15T12:00:00.000Z");
  });

  it("shows (none) for missing description and dueby", async () => {
    const log = vi.fn();
    const tickets = [
      {
        id: 1,
        title: "x",
        description: "",
        status: "todo" as const,
        priority: "low" as const,
        dueby: null,
      },
    ];

    await showHandler("1", { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith("Description: (none)");
    expect(log).toHaveBeenCalledWith("Due: (none)");
  });

  it("exits with error when ticket not found", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await showHandler("999", { loadTickets: async () => [], log: vi.fn() });

    expect(errorSpy).toHaveBeenCalledWith("No ticket found with id 999");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
