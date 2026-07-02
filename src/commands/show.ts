import type { ShowHandlerDeps } from "../types.js";

export async function showHandler(id: string, deps: ShowHandlerDeps) {
  const { getTicketById, log = console.log } = deps;
  const numId = Number(id);
  const ticket = getTicketById(numId);

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
