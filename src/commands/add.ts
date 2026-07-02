import { priorityChoices } from "../tools/index.js";
import type { AddHandlerDeps, AddOptions, Ticket } from "../types.js";

export async function addHandler(
  title: string | undefined,
  options: AddOptions,
  deps: AddHandlerDeps,
) {
  const { inputPrompt, selectPrompt } = deps;

  const ticketTitle =
    title ||
    (await inputPrompt({
      message: "Enter the title:",
      default: "New Ticket",
      required: true,
    }));

  const ticketDescription = options.description ?? "";
  const ticketPriority =
    options.priority ??
    (title
      ? "medium"
      : await selectPrompt({
          message: "Choose a priority:",
          choices: priorityChoices,
          default: "medium",
        }));
  const ticketStatus = options.status ?? "todo";
  const ticketDueby = options.dueby ?? null;

  const newTicket: Ticket = {
    id: Date.now(),
    title: ticketTitle,
    description: ticketDescription,
    status: ticketStatus,
    priority: ticketPriority,
    dueby: ticketDueby,
  };

  const tickets = await deps.loadTickets();
  tickets.push(newTicket);
  await deps.saveTickets(tickets);
  deps.log?.(`Added: ${newTicket.title}`);
}
