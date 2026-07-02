import type { input, select } from "@inquirer/prompts";
import type { date } from "./tools/date-prompt.js";

export type Status = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";
export type InputPromptFunction = typeof input;
export type SelectPromptFunction = typeof select;
export type DatePromptFunction = typeof date;

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueby: string | null;
}

export interface HandlerDeps {
  log?: (message: string) => void;
}

export interface TicketReadDeps extends HandlerDeps {
  getTickets: () => Ticket[];
  getTicketById: (id: number) => Ticket | undefined;
}

export interface TicketWriteDeps extends TicketReadDeps {
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: number, fields: Partial<Ticket>) => void;
  deleteTicket: (id: number) => void;
}

export interface AddHandlerDeps extends TicketWriteDeps {
  inputPrompt: InputPromptFunction;
  selectPrompt: SelectPromptFunction;
  datePrompt: DatePromptFunction;
}

export interface ListHandlerDeps extends TicketReadDeps {}

export interface ShowHandlerDeps extends TicketReadDeps {}

export interface UpdateHandlerDeps extends TicketWriteDeps {}

export interface StatusHandlerDeps extends TicketWriteDeps {}

export interface RemoveHandlerDeps extends TicketWriteDeps {}

export interface SearchHandlerDeps extends TicketReadDeps {}

export interface AddOptions {
  description?: string;
  priority?: Priority;
  status?: Status;
  dueby?: string | boolean;
}

export interface ListOptions {
  all?: boolean;
  status?: Status;
  priority?: Priority;
}

export interface UpdateOptions {
  title?: string;
  description?: string;
  priority?: Priority;
  dueby?: string;
}

export interface SearchOptions {
  query: string;
  title?: boolean;
  id?: boolean;
  priority?: Priority;
  status?: Status;
  caseSensitive?: boolean;
}

export interface StatusChoice {
  name: string;
  value: Status;
  description: string;
}

export interface PriorityChoice {
  name: string;
  value: Priority;
  description: string;
}
