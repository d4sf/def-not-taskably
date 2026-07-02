import type { Status, StatusHandlerDeps } from "../types.js";

export async function statusHandler(id: string, status: Status, deps: StatusHandlerDeps) {
  const { updateTicket, getTicketById, log = console.log } = deps;
  const numId = Number(id);
  const ticket = getTicketById(numId);

  if (!ticket) {
    console.error(`No ticket found with id ${id}`);
    process.exit(1);
    return;
  }

  updateTicket(numId, { status });
  log(`Ticket ${id} status changed to ${status}: ${ticket.title}`);
}
