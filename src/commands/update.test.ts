import { describe, expect, it, vi } from "vitest";
import { updateHandler } from "./update.js";

const baseTicket = {
  id: 1,
  title: "original",
  description: "desc",
  status: "todo" as const,
  priority: "low" as const,
  dueby: null,
};

describe("updateHandler", () => {
  it("updates title", async () => {
    const updateTicket = vi.fn();

    await updateHandler(
      "1",
      { title: "new title" },
      {
        getTickets: () => [baseTicket],
        getTicketById: (id) => [baseTicket].find((t) => t.id === id),
        updateTicket,
        log: vi.fn(),
      },
    );

    expect(updateTicket).toHaveBeenCalledOnce();
    const saved = updateTicket.mock.calls[0][1];
    expect(saved.title).toBe("new title");
  });

  it("updates multiple fields", async () => {
    const updateTicket = vi.fn();

    await updateHandler(
      "1",
      {
        title: "new",
        description: "new desc",
        priority: "high",
        dueby: "2026-08-01T00:00:00.000Z",
      },
      {
        getTickets: () => [baseTicket],
        getTicketById: (id) => [baseTicket].find((t) => t.id === id),
        updateTicket,
        log: vi.fn(),
      },
    );

    const saved = updateTicket.mock.calls[0][1];
    expect(saved.title).toBe("new");
    expect(saved.description).toBe("new desc");
    expect(saved.priority).toBe("high");
    expect(saved.dueby).toBe("2026-08-01T00:00:00.000Z");
  });

  it("fails when no update flags provided", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await updateHandler(
      "1",
      {},
      {
        getTickets: () => [baseTicket],
        getTicketById: (id) => [baseTicket].find((t) => t.id === id),
        updateTicket: vi.fn(),
        log: vi.fn(),
      },
    );

    expect(errorSpy).toHaveBeenCalledWith(
      "No updates provided. Use --title, --description, --priority, or --dueby",
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("fails when ticket not found", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await updateHandler(
      "999",
      { title: "x" },
      {
        getTickets: () => [],
        getTicketById: () => undefined,
        updateTicket: vi.fn(),
        log: vi.fn(),
      },
    );

    expect(errorSpy).toHaveBeenCalledWith("No ticket found with id 999");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
