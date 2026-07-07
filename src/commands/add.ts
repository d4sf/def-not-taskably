import { priorityChoices } from "../tools/index.js";
import type { AddHandlerDeps, AddOptions, Ticket } from "../types.js";

export async function addHandler(
  title: string | undefined,
  options: AddOptions,
  deps: AddHandlerDeps,
) {
  const { inputPrompt, selectPrompt, datePrompt } = deps;

  const ticketTitle =
    title ||
    (await inputPrompt({
      message: "Enter the title:",
      default: "New Ticket",
      required: true,
    }));

  const ticketDescription =
    options.description ??
    (title
      ? ""
      : await inputPrompt({
          message: "Enter the description:",
          default: "",
        }));
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
  const ticketDueby = await (async () => {
    if (options.dueby === undefined) {
      if (title) return null;
      const d = await datePrompt({ message: "Due date (optional):", default: undefined });
      return d?.toISOString() ?? null;
    }
    if (options.dueby === true) {
      const d = await datePrompt({ message: "Due date:", default: undefined });
      return d?.toISOString() ?? null;
    }
    return typeof options.dueby === "string" ? options.dueby : null;
  })();

  const newTicket: Ticket = {
    id: Date.now(),
    title: ticketTitle,
    description: ticketDescription,
    status: ticketStatus,
    priority: ticketPriority,
    dueby: ticketDueby,
  };

  deps.addTicket(newTicket);
  deps.log?.(`Added: ${newTicket.title}`);
}
