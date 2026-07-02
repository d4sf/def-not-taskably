import Database from "better-sqlite3";
import { resolve } from "node:path";
import type { Ticket } from "../types.js";

const dbPath = resolve(process.cwd(), ".magnetar.db");
const db = new Database(dbPath);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    dueby TEXT
  )
`);

export function getTickets(): Ticket[] {
  const stmt = db.prepare("SELECT * FROM tickets");
  return stmt.all() as Ticket[];
}

export function getTicketById(id: number): Ticket | undefined {
  const stmt = db.prepare("SELECT * FROM tickets WHERE id = ?");
  return stmt.get(id) as Ticket | undefined;
}

export function addTicket(ticket: Ticket): void {
  const stmt = db.prepare(`
    INSERT INTO tickets (id, title, description, status, priority, dueby)
    VALUES (@id, @title, @description, @status, @priority, @dueby)
  `);
  stmt.run(ticket);
}

export function updateTicket(id: number, fields: Partial<Ticket>): void {
  const current = getTicketById(id);
  if (!current) throw new Error(`Ticket with id ${id} not found`);

  const updated = { ...current, ...fields };
  const stmt = db.prepare(`
    UPDATE tickets 
    SET title = @title, description = @description, status = @status, priority = @priority, dueby = @dueby
    WHERE id = @id
  `);
  stmt.run(updated);
}

export function deleteTicket(id: number): void {
  const stmt = db.prepare("DELETE FROM tickets WHERE id = ?");
  stmt.run(id);
}
