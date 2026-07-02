import type { RemoveHandlerDeps } from "../types.js";

export async function removeHandler(id: string, deps: RemoveHandlerDeps) {
  const { deleteTicket, getTicketById, log = console.log } = deps;
  const numId = Number(id);
  const ticket = getTicketById(numId);

  if (!ticket) {
    console.error(`No ticket found with id ${id}`);
    process.exit(1);
    return;
  }

  deleteTicket(numId);
  log(`Removed ticket ${id}`);
}
