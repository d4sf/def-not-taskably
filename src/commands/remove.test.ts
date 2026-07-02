import { describe, expect, it, vi } from "vitest";
import { removeHandler } from "./remove.js";

describe("removeHandler", () => {
  it("removes a ticket by id", async () => {
    const saveTickets = vi.fn();
    const tickets = [
      {
        id: 1,
        title: "keep",
        description: "",
        status: "todo" as const,
        priority: "low" as const,
        dueby: null,
      },
      {
        id: 2,
        title: "remove",
        description: "",
        status: "todo" as const,
        priority: "low" as const,
        dueby: null,
      },
    ];

    await removeHandler("2", { loadTickets: async () => tickets, saveTickets, log: vi.fn() });

    const saved = saveTickets.mock.calls[0][0];
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe(1);
  });

  it("fails when ticket not found", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await removeHandler("999", { loadTickets: async () => [], saveTickets: vi.fn(), log: vi.fn() });

    expect(errorSpy).toHaveBeenCalledWith("No ticket found with id 999");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
