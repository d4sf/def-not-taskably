import type { SearchHandlerDeps, SearchOptions } from "../types.js";

export async function searchHandler(options: SearchOptions, deps: SearchHandlerDeps) {
  const { query, id, priority, status, caseSensitive } = options;
  const { loadTickets, log = console.log } = deps;
  const tickets = await loadTickets();

  let filtered = tickets;

  if (id) {
    filtered = filtered.filter((t) => t.id.toString().includes(query));
  }

  if (query && !id) {
    filtered = filtered.filter((t) => {
      const haystack = caseSensitive
        ? t.title + t.description
        : (t.title + t.description).toLowerCase();
      const needle = caseSensitive ? query : query.toLowerCase();
      return haystack.includes(needle);
    });
  }

  if (priority) {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  if (filtered.length === 0) {
    log("No tickets found.");
    return;
  }

  for (const ticket of filtered) {
    log(`[${ticket.status}] ${ticket.id} (${ticket.priority}) - ${ticket.title} - ${ticket.description}`);
  }
}
