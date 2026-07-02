import type { ShowHandlerDeps } from "../types.js";

export async function showHandler(id: string, deps: ShowHandlerDeps) {
  const { loadTickets, log = console.log } = deps;
  const tickets = await loadTickets();
  const ticket = tickets.find((t) => String(t.id) === id);

  if (!ticket) {
    console.error(`No ticket found with id ${id}`);
    process.exit(1);
    return;
  }

  log(`ID: ${ticket.id}`);
  log(`Title: ${ticket.title}`);
  log(`Description: ${ticket.description || "(none)"}`);
  log(`Status: ${ticket.status}`);
  log(`Priority: ${ticket.priority}`);
  log(`Due: ${ticket.dueby || "(none)"}`);
}
