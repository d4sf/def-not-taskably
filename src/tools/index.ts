import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Priority, PriorityChoice, Status, StatusChoice, Ticket } from "../types.js";

const TICKET_FILE = resolve(process.cwd(), "magnetar.json");

export async function loadTickets(): Promise<Ticket[]> {
  try {
    const data = await readFile(TICKET_FILE, "utf-8");
    const tickets = JSON.parse(data) as Ticket[];
    return tickets.map((t) => ({ ...t, description: t.description ?? "", dueby: t.dueby ?? null }));
  } catch (error) {
    if (error instanceof Error && (error as { code?: string }).code === "ENOENT") return [];
    throw error;
  }
}

export async function saveTickets(tickets: Ticket[]): Promise<void> {
  await writeFile(TICKET_FILE, JSON.stringify(tickets, null, 2));
}

export function validatePriority(value: string): Priority {
  const allowed: Priority[] = ["low", "medium", "high"];
  if (!allowed.includes(value as Priority)) {
    throw new Error(`Priority must be one of: ${allowed.join(", ")}`);
  }
  return value as Priority;
}

export function validateStatus(value: string): Status {
  const allowed: Status[] = ["todo", "in_progress", "done"];
  if (!allowed.includes(value as Status)) {
    throw new Error(`Status must be one of: ${allowed.join(", ")}`);
  }
  return value as Status;
}

export const priorityChoices: PriorityChoice[] = [
  { name: "High", value: "high", description: "Urgent priority" },
  { name: "Medium", value: "medium", description: "Normal priority" },
  { name: "Low", value: "low", description: "Low priority" },
];

export const statusChoices: StatusChoice[] = [
  { name: "Todo", value: "todo", description: "Not started" },
  { name: "In Progress", value: "in_progress", description: "Currently working" },
  { name: "Done", value: "done", description: "Completed" },
];
