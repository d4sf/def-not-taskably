export * from "./db.js";

import type { Priority, PriorityChoice, Status, StatusChoice } from "../types.js";

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
