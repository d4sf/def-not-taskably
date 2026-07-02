import { describe, expect, it, vi } from "vitest";
import { listHandler } from "./list.js";

const makeTicket = (overrides = {}) => ({
  id: 1,
  title: "ticket",
  description: "",
  status: "todo" as const,
  priority: "medium" as const,
  dueby: null,
  ...overrides,
});

describe("listHandler", () => {
  it("shows pending tickets by default (hides done)", async () => {
    const log = vi.fn();
    const tickets = [
      makeTicket({ id: 1, title: "active", status: "in_progress" }),
      makeTicket({ id: 2, title: "finished", status: "done" }),
    ];

    await listHandler({}, { getTickets: () => tickets, getTicketById: vi.fn(), log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("active"));
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("finished"));
  });

  it("shows done tickets with --all", async () => {
    const log = vi.fn();
    const tickets = [
      makeTicket({ id: 1, title: "active", status: "todo" }),
      makeTicket({ id: 2, title: "finished", status: "done" }),
    ];

    await listHandler({ all: true }, { getTickets: () => tickets, getTicketById: vi.fn(), log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("active"));
    expect(log).toHaveBeenCalledWith(expect.stringContaining("finished"));
  });

  it("filters by status", async () => {
    const log = vi.fn();
    const tickets = [
      makeTicket({ id: 1, title: "todo item", status: "todo" }),
      makeTicket({ id: 2, title: "in progress", status: "in_progress" }),
      makeTicket({ id: 3, title: "done item", status: "done" }),
    ];

    await listHandler({ status: "todo" }, { getTickets: () => tickets, getTicketById: vi.fn(), log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("todo item"));
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("in progress"));
  });

  it("filters by priority", async () => {
    const log = vi.fn();
    const tickets = [
      makeTicket({ id: 1, title: "high priority", priority: "high" }),
      makeTicket({ id: 2, title: "low priority", priority: "low" }),
    ];

    await listHandler({ priority: "high" }, { getTickets: () => tickets, getTicketById: vi.fn(), log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("high priority"));
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("low priority"));
  });

  it("shows message when no tickets match", async () => {
    const log = vi.fn();

    await listHandler({}, { getTickets: () => [], getTicketById: vi.fn(), log });

    expect(log).toHaveBeenCalledWith("No tickets found.");
  });
});
