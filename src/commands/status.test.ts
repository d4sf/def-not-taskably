import { describe, expect, it, vi } from "vitest";
import { statusHandler } from "./status.js";

describe("statusHandler", () => {
  it("changes status of a ticket", async () => {
    const updateTicket = vi.fn();
    const tickets = [
      {
        id: 1,
        title: "test",
        description: "",
        status: "todo" as const,
        priority: "medium" as const,
        dueby: null,
      },
    ];

    await statusHandler("1", "done", {
      getTickets: () => tickets,
      getTicketById: (id) => tickets.find((t) => t.id === id),
      updateTicket,
      log: vi.fn(),
    });

    const saved = updateTicket.mock.calls[0][1];
    expect(saved.status).toBe("done");
  });

  it("fails when ticket not found", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await statusHandler("999", "done", {
      getTickets: () => [],
      getTicketById: () => undefined,
      updateTicket: vi.fn(),
      log: vi.fn(),
    });

    expect(errorSpy).toHaveBeenCalledWith("No ticket found with id 999");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
