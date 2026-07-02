import type { UpdateHandlerDeps, UpdateOptions } from "../types.js";

export async function updateHandler(id: string, options: UpdateOptions, deps: UpdateHandlerDeps) {
  const { loadTickets, saveTickets, log = console.log } = deps;
  const { title, description, priority, dueby } = options;

  if (!title && !description && !priority && !dueby) {
    console.error("No updates provided. Use --title, --description, --priority, or --dueby");
    process.exit(1);
    return;
  }

  const tickets = await loadTickets();
  const ticket = tickets.find((t) => String(t.id) === id);

  if (!ticket) {
    console.error(`No ticket found with id ${id}`);
    process.exit(1);
    return;
  }

  if (title !== undefined) {
    if (title.trim().length === 0) {
      console.error("Title cannot be empty");
      process.exit(1);
      return;
    }
    ticket.title = title;
  }

  if (description !== undefined) {
    ticket.description = description;
  }

  if (priority !== undefined) {
    ticket.priority = priority;
  }

  if (dueby !== undefined) {
    ticket.dueby = dueby;
  }

  await saveTickets(tickets);

  const updates: string[] = [];
  if (title !== undefined) updates.push("title");
  if (description !== undefined) updates.push("description");
  if (priority !== undefined) updates.push("priority");
  if (dueby !== undefined) updates.push("dueby");

  log(`Updated ${updates.join(" and ")} for ticket ${id}: ${ticket.title}`);
}
