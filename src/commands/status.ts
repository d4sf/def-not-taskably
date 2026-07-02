import type { Status, StatusHandlerDeps } from "../types.js";

export async function statusHandler(id: string, status: Status, deps: StatusHandlerDeps) {
  const { loadTickets, saveTickets, log = console.log } = deps;
  const tickets = await loadTickets();
  const ticket = tickets.find((t) => String(t.id) === id);

  if (!ticket) {
    console.error(`No ticket found with id ${id}`);
    process.exit(1);
    return;
  }

  ticket.status = status;
  await saveTickets(tickets);
  log(`Ticket ${id} status changed to ${status}: ${ticket.title}`);
}
