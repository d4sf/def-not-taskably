import { describe, expect, it, vi } from "vitest";
import { searchHandler } from "./search.js";

const tickets = [
  {
    id: 1,
    title: "Fix login bug",
    description: "Users cannot log in",
    status: "todo" as const,
    priority: "high" as const,
    dueby: null,
  },
  {
    id: 2,
    title: "Add dark mode",
    description: "UI improvement",
    status: "in_progress" as const,
    priority: "medium" as const,
    dueby: null,
  },
  {
    id: 3,
    title: "Deploy",
    description: "Ship to production",
    status: "done" as const,
    priority: "low" as const,
    dueby: "2026-07-20T00:00:00.000Z",
  },
];

describe("searchHandler", () => {
  it("searches by text in title and description", async () => {
    const log = vi.fn();

    await searchHandler({ query: "login" }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("Fix login bug"));
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("Deploy"));
  });

  it("searches by id", async () => {
    const log = vi.fn();

    await searchHandler({ query: "3", id: true }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("Deploy"));
  });

  it("filters by priority", async () => {
    const log = vi.fn();

    await searchHandler({ query: "", priority: "high" }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("Fix login bug"));
  });

  it("filters by status", async () => {
    const log = vi.fn();

    await searchHandler({ query: "", status: "done" }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("Deploy"));
  });

  it("supports case-sensitive search", async () => {
    const log = vi.fn();

    await searchHandler(
      { query: "LOGIN", caseSensitive: true },
      { loadTickets: async () => tickets, log },
    );

    expect(log).toHaveBeenCalledWith("No tickets found.");
  });

  it("shows message when no results", async () => {
    const log = vi.fn();

    await searchHandler({ query: "nonexistent" }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith("No tickets found.");
  });
});
