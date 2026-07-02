import type { RemoveHandlerDeps } from "../types.js";

export async function removeHandler(id: string, deps: RemoveHandlerDeps) {
  const { loadTickets, saveTickets, log = console.log } = deps;
  const tickets = await loadTickets();
  const next = tickets.filter((t) => String(t.id) !== id);

  if (next.length === tickets.length) {
    console.error(`No ticket found with id ${id}`);
    process.exit(1);
    return;
  }

  await saveTickets(next);
  log(`Removed ticket ${id}`);
}
