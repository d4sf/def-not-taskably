import type { ListHandlerDeps, ListOptions } from "../types.js";

export async function listHandler(options: ListOptions, deps: ListHandlerDeps) {
  const { loadTickets, log = console.log } = deps;
  const tickets = await loadTickets();
  const filtered = tickets
    .filter((t) => options.all || t.status !== "done")
    .filter((t) => !options.status || t.status === options.status)
    .filter((t) => !options.priority || t.priority === options.priority);

  if (filtered.length === 0) {
    log("No tickets found.");
    return;
  }

  for (const ticket of filtered) {
    const statusIcon = ticket.status === "done" ? "[x]" : "[ ]";
    log(`${statusIcon} ${ticket.id} (${ticket.status}, ${ticket.priority}) - ${ticket.title}`);
    if (ticket.description) {
      const truncated = ticket.description.length > 40
        ? `${ticket.description.slice(0, 37)}...`
        : ticket.description;
      log(`   ${truncated}`);
    }
  }
}
