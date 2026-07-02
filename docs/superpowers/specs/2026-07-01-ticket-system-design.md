# Ticket System — Design Spec

## Goal

Transform `dnt` from a simple todo list CLI into a ticket management tool. Tickets have title, description, status, priority, and dueby. Commands are grouped under `dnt ticket <>`. The schema changes from `Task` with a `done` boolean to `Ticket` with a three-value `status` enum and an optional ISO timestamp `dueby`.

---

## Schema

**File:** `magnetar.json` in cwd (renamed from `.taskly.json`)

```typescript
type Status = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";

interface Ticket {
  id: number;           // Date.now()
  title: string;
  description: string;
  status: Status;       // replaces done: boolean
  priority: Priority;
  dueby: string | null; // ISO 8601 timestamp, optional
}
```

---

## Types (`src/types.ts`)

Same DI pattern as current codebase:

```typescript
interface HandlerDeps {
  log?: (message: string) => void;
}

interface TicketReadDeps extends HandlerDeps {
  loadTickets: () => Promise<Ticket[]>;
}

interface TicketWriteDeps extends TicketReadDeps {
  saveTickets: (tickets: Ticket[]) => Promise<void>;
}

interface AddHandlerDeps extends TicketWriteDeps {
  inputPrompt: InputPromptFunction;
  selectPrompt: SelectPromptFunction;
}
```

Each command gets its own `*HandlerDeps` extending either `TicketReadDeps` or `TicketWriteDeps` depending on whether it modifies data.

---

## CLI Commands

All commands grouped under `dnt ticket <>`:

| Command | Usage | Description |
|---------|-------|-------------|
| `add` | `dnt ticket add [title]` | Create ticket. `--description`, `--priority` (def: medium), `--dueby`, `--status` (def: todo). Interactive prompts if title missing. |
| `list` | `dnt ticket list` | List tickets. `--all` (incl. done), `--status`, `--priority`. Default hides `done`. |
| `show` | `dnt ticket show <id>` | Show full ticket details. |
| `update` | `dnt ticket update <id>` | Edit fields. `--title`, `--description`, `--priority`, `--dueby`. Requires at least one flag. |
| `status` | `dnt ticket status <id> <status>` | Set status to `todo`/`in_progress`/`done`. |
| `remove` | `dnt ticket remove <id>` (alias: `rm`) | Delete ticket by ID. |
| `search` | `dnt ticket search <query>` | Search. `--title`, `--id`, `--priority`, `--status`, `--case-sensitive`. |

---

## File Structure

```
src/
  index.ts              — CLI entrypoint with commander
  types.ts              — Ticket, Status, Priority, deps interfaces
  tools/
    index.ts            — loadTickets, saveTickets, validatePriority, validateStatus
  commands/
    add.ts / add.test.ts
    list.ts / list.test.ts
    show.ts / show.test.ts
    update.ts / update.test.ts
    status.ts / status.test.ts
    remove.ts / remove.test.ts
    search.ts / search.test.ts
```

---

## Error Handling

- User errors (ticket not found, invalid flags, empty fields): `console.error()` + `process.exit(1)`
- Unexpected errors: caught by the global try/catch in `index.ts`
- Same pattern as current codebase

---

## Testing

- Vitest, same DI pattern with `vi.fn()` mocks for `loadTickets`/`saveTickets`
- Each handler tested in isolation with injected deps
- No file I/O in unit tests

---

## What Gets Removed

- `.taskly.json` — replaced by `magnetar.json`
- `src/commands/done.ts`, `undone.ts` — no longer needed
- All existing `add.test.ts`, `list.test.ts`, etc — rewritten for Ticket type
- Old `Task` type — replaced by `Ticket`
- Old helper functions for `done`/`undone` — removed
