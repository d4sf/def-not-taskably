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
    const saveTickets = vi.fn();

    await updateHandler(
      "1",
      { title: "new title" },
      {
        loadTickets: async () => [baseTicket],
        saveTickets,
        log: vi.fn(),
      },
    );

    expect(saveTickets).toHaveBeenCalledOnce();
    const saved = saveTickets.mock.calls[0][0];
    expect(saved[0].title).toBe("new title");
  });

  it("updates multiple fields", async () => {
    const saveTickets = vi.fn();

    await updateHandler(
      "1",
      {
        title: "new",
        description: "new desc",
        priority: "high",
        dueby: "2026-08-01T00:00:00.000Z",
      },
      {
        loadTickets: async () => [baseTicket],
        saveTickets,
        log: vi.fn(),
      },
    );

    const saved = saveTickets.mock.calls[0][0];
    expect(saved[0].title).toBe("new");
    expect(saved[0].description).toBe("new desc");
    expect(saved[0].priority).toBe("high");
    expect(saved[0].dueby).toBe("2026-08-01T00:00:00.000Z");
  });

  it("fails when no update flags provided", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await updateHandler(
      "1",
      {},
      {
        loadTickets: async () => [baseTicket],
        saveTickets: vi.fn(),
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
        loadTickets: async () => [],
        saveTickets: vi.fn(),
        log: vi.fn(),
      },
    );

    expect(errorSpy).toHaveBeenCalledWith("No ticket found with id 999");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
