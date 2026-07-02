# Ticket System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `dnt` from a todo-list CLI to a ticket management tool with grouped commands (`dnt ticket <>`), a `Ticket` type with `status` enum and `dueby` field, and storage in `magnetar.json`.

**Architecture:** Rewrite from scratch — new types (`Ticket`, `Status`, `Priority`), new tools (`loadTickets`, `saveTickets`), 7 commands under `dnt ticket <>` (`add`, `list`, `show`, `update`, `status`, `remove`, `search`), all with DI pattern for testability. Old handlers (`done`, `undone`) are removed.

**Tech Stack:** TypeScript 6, ESM, Commander.js, Vitest, Inquirer

**File structure:**
```
src/
  index.ts                — CLI entrypoint, groups commands under dnt ticket
  types.ts                — Ticket, Status, Priority, deps interfaces
  tools/
    index.ts              — loadTickets, saveTickets, validatePriority, validateStatus
  commands/
    add.ts / add.test.ts
    list.ts / list.test.ts
    show.ts / show.test.ts
    update.ts / update.test.ts
    status.ts / status.test.ts
    remove.ts / remove.test.ts
    search.ts / search.test.ts
```

**What gets removed:** `src/commands/done.ts`, `src/commands/undone.ts`, `src/commands/done.test.ts`, `src/commands/undone.test.ts`, all old test files (rewritten), `.taskly.json`

---
### Task 1: Types and Tools

**Files:**
- Modify: `src/types.ts`
- Modify: `src/tools/index.ts`

- [ ] **Step 1: Rewrite `src/types.ts`**

```typescript
import type { input, select } from "@inquirer/prompts";

export type Status = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";
export type InputPromptFunction = typeof input;
export type SelectPromptFunction = typeof select;

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
  loadTickets: () => Promise<Ticket[]>;
}

export interface TicketWriteDeps extends TicketReadDeps {
  saveTickets: (tickets: Ticket[]) => Promise<void>;
}

export interface AddHandlerDeps extends TicketWriteDeps {
  inputPrompt: InputPromptFunction;
  selectPrompt: SelectPromptFunction;
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
  dueby?: string;
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
```

- [ ] **Step 2: Rewrite `src/tools/index.ts`**

```typescript
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Priority, PriorityChoice, Status, StatusChoice, Ticket } from "../types.js";

const TICKET_FILE = resolve(process.cwd(), "magnetar.json");

export async function loadTickets(): Promise<Ticket[]> {
  try {
    const data = await readFile(TICKET_FILE, "utf-8");
    const tickets = JSON.parse(data) as Ticket[];
    return tickets.map((t) => ({ description: "", dueby: null, ...t })) as Ticket[];
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
```

- [ ] **Step 3: Verify types and tools compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/tools/index.ts
git commit -m "feat: add Ticket types and tools"
```

---

### Task 2: add Handler

**Files:**
- Create: `src/commands/add.ts`
- Create: `src/commands/add.test.ts`

- [ ] **Step 1: Write `src/commands/add.test.ts`**

```typescript
import { describe, expect, it, vi } from "vitest";
import { addHandler } from "./add.js";

describe("addHandler", () => {
  it("creates a ticket with given title and default values", async () => {
    const saveTickets = vi.fn();
    const log = vi.fn();

    await addHandler(
      "my ticket",
      {},
      {
        loadTickets: async () => [],
        saveTickets,
        log,
        inputPrompt: vi.fn(),
        selectPrompt: vi.fn(),
      },
    );

    expect(saveTickets).toHaveBeenCalledOnce();
    const saved = saveTickets.mock.calls[0][0];
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe("my ticket");
    expect(saved[0].status).toBe("todo");
    expect(saved[0].priority).toBe("medium");
    expect(saved[0].dueby).toBeNull();
    expect(saved[0].description).toBe("");
    expect(typeof saved[0].id).toBe("number");
    expect(log).toHaveBeenCalledWith("Added: my ticket");
  });

  it("creates a ticket with all options provided", async () => {
    const saveTickets = vi.fn();

    await addHandler(
      "bug fix",
      { priority: "high", status: "in_progress", description: "fix the thing", dueby: "2026-07-15T12:00:00.000Z" },
      {
        loadTickets: async () => [],
        saveTickets,
        log: vi.fn(),
        inputPrompt: vi.fn(),
        selectPrompt: vi.fn(),
      },
    );

    const saved = saveTickets.mock.calls[0][0];
    expect(saved[0].title).toBe("bug fix");
    expect(saved[0].priority).toBe("high");
    expect(saved[0].status).toBe("in_progress");
    expect(saved[0].description).toBe("fix the thing");
    expect(saved[0].dueby).toBe("2026-07-15T12:00:00.000Z");
  });

  it("uses interactive prompts when title is not provided", async () => {
    const saveTickets = vi.fn();
    const inputPrompt = vi.fn().mockResolvedValueOnce("Prompted Title");
    const selectPrompt = vi.fn().mockResolvedValueOnce("high");

    await addHandler(
      undefined,
      {},
      {
        loadTickets: async () => [],
        saveTickets,
        log: vi.fn(),
        inputPrompt,
        selectPrompt,
      },
    );

    expect(inputPrompt).toHaveBeenCalledTimes(1);
    expect(selectPrompt).toHaveBeenCalledTimes(1);

    const saved = saveTickets.mock.calls[0][0];
    expect(saved[0].title).toBe("Prompted Title");
    expect(saved[0].priority).toBe("high");
  });

  it("appends to existing tickets", async () => {
    const existing = [{ id: 1, title: "old", description: "", status: "todo" as const, priority: "low" as const, dueby: null }];
    const saveTickets = vi.fn();

    await addHandler(
      "second",
      { priority: "high" },
      {
        loadTickets: async () => existing,
        saveTickets,
        log: vi.fn(),
        inputPrompt: vi.fn(),
        selectPrompt: vi.fn(),
      },
    );

    const saved = saveTickets.mock.calls[0][0];
    expect(saved).toHaveLength(2);
    expect(saved[1].title).toBe("second");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/commands/add.test.ts
```

Expected: FAIL — `addHandler` not exported.

- [ ] **Step 3: Write `src/commands/add.ts`**

```typescript
import { priorityChoices, statusChoices } from "../tools/index.js";
import type { AddHandlerDeps, AddOptions, Ticket, TicketWriteDeps } from "../types.js";

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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/commands/add.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/commands/add.ts src/commands/add.test.ts
git commit -m "feat: add ticket add command"
```

---

### Task 3: list Handler

**Files:**
- Create: `src/commands/list.ts`
- Create: `src/commands/list.test.ts`

- [ ] **Step 1: Write `src/commands/list.test.ts`**

```typescript
import { describe, expect, it, vi } from "vitest";
import { listHandler } from "./list.js";

const makeTicket = (overrides = {}) => ({
  id: 1,
  title: "ticket",
  description: "",
  status: "todo" as const,
  priority: "medium" as const,
  dueby: null,
  ...overrides,
});

describe("listHandler", () => {
  it("shows pending tickets by default (hides done)", async () => {
    const log = vi.fn();
    const tickets = [
      makeTicket({ id: 1, title: "active", status: "in_progress" }),
      makeTicket({ id: 2, title: "finished", status: "done" }),
    ];

    await listHandler({}, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("active"));
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("finished"));
  });

  it("shows done tickets with --all", async () => {
    const log = vi.fn();
    const tickets = [
      makeTicket({ id: 1, title: "active", status: "todo" }),
      makeTicket({ id: 2, title: "finished", status: "done" }),
    ];

    await listHandler({ all: true }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("active"));
    expect(log).toHaveBeenCalledWith(expect.stringContaining("finished"));
  });

  it("filters by status", async () => {
    const log = vi.fn();
    const tickets = [
      makeTicket({ id: 1, title: "todo item", status: "todo" }),
      makeTicket({ id: 2, title: "in progress", status: "in_progress" }),
      makeTicket({ id: 3, title: "done item", status: "done" }),
    ];

    await listHandler({ status: "todo" }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("todo item"));
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("in progress"));
  });

  it("filters by priority", async () => {
    const log = vi.fn();
    const tickets = [
      makeTicket({ id: 1, title: "high priority", priority: "high" }),
      makeTicket({ id: 2, title: "low priority", priority: "low" }),
    ];

    await listHandler({ priority: "high" }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("high priority"));
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("low priority"));
  });

  it("shows message when no tickets match", async () => {
    const log = vi.fn();

    await listHandler({}, { loadTickets: async () => [], log });

    expect(log).toHaveBeenCalledWith("No tickets found.");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/commands/list.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write `src/commands/list.ts`**

```typescript
import type { ListHandlerDeps, ListOptions } from "../types.js";

export async function listHandler(options: ListOptions, deps: ListHandlerDeps) {
  const { loadTickets, log = console.log } = deps;
  const tickets = await loadTickets();
  const filtered = tickets
    .filter((t) => options.all || t.status !== "done")
    .filter((t) => !options.status || t.status === options.status)
    .filter((t) => !options.priority || t.priority === options.priority);

  if (filtered.length === 0) {
    log("No tickets found.");
    return;
  }

  for (const ticket of filtered) {
    const statusIcon = ticket.status === "done" ? "[x]" : "[ ]";
    log(`${statusIcon} ${ticket.id} (${ticket.status}, ${ticket.priority}) - ${ticket.title}`);
    if (ticket.description) {
      const truncated = ticket.description.length > 40
        ? `${ticket.description.slice(0, 37)}...`
        : ticket.description;
      log(`   ${truncated}`);
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/commands/list.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/commands/list.ts src/commands/list.test.ts
git commit -m "feat: add ticket list command"
```

---

### Task 4: show Handler

**Files:**
- Create: `src/commands/show.ts`
- Create: `src/commands/show.test.ts`

- [ ] **Step 1: Write `src/commands/show.test.ts`**

```typescript
import { describe, expect, it, vi } from "vitest";
import { showHandler } from "./show.js";

describe("showHandler", () => {
  it("displays full ticket details", async () => {
    const log = vi.fn();
    const tickets = [
      { id: 42, title: "Test Ticket", description: "A test", status: "in_progress" as const, priority: "high" as const, dueby: "2026-07-15T12:00:00.000Z" },
    ];

    await showHandler("42", { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith("ID: 42");
    expect(log).toHaveBeenCalledWith("Title: Test Ticket");
    expect(log).toHaveBeenCalledWith("Description: A test");
    expect(log).toHaveBeenCalledWith("Status: in_progress");
    expect(log).toHaveBeenCalledWith("Priority: high");
    expect(log).toHaveBeenCalledWith("Due: 2026-07-15T12:00:00.000Z");
  });

  it("shows (none) for missing description", async () => {
    const log = vi.fn();
    const tickets = [
      { id: 1, title: "x", description: "", status: "todo" as const, priority: "low" as const, dueby: null },
    ];

    await showHandler("1", { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith("Description: (none)");
    expect(log).toHaveBeenCalledWith("Due: (none)");
  });

  it("exits with error when ticket not found", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await showHandler("999", { loadTickets: async () => [], log: vi.fn() });

    expect(errorSpy).toHaveBeenCalledWith("No ticket found with id 999");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/commands/show.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write `src/commands/show.ts`**

```typescript
import type { ShowHandlerDeps } from "../types.js";

export async function showHandler(id: string, deps: ShowHandlerDeps) {
  const { loadTickets, log = console.log } = deps;
  const tickets = await loadTickets();
  const ticket = tickets.find((t) => String(t.id) === id);

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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/commands/show.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/commands/show.ts src/commands/show.test.ts
git commit -m "feat: add ticket show command"
```

---

### Task 5: update Handler

**Files:**
- Create: `src/commands/update.ts`
- Create: `src/commands/update.test.ts`

- [ ] **Step 1: Write `src/commands/update.test.ts`**

```typescript
import { describe, expect, it, vi } from "vitest";
import { updateHandler } from "./update.js";

const baseTicket = { id: 1, title: "original", description: "desc", status: "todo" as const, priority: "low" as const, dueby: null };

describe("updateHandler", () => {
  it("updates title", async () => {
    const saveTickets = vi.fn();

    await updateHandler("1", { title: "new title" }, {
      loadTickets: async () => [baseTicket],
      saveTickets,
      log: vi.fn(),
    });

    expect(saveTickets).toHaveBeenCalledOnce();
    const saved = saveTickets.mock.calls[0][0];
    expect(saved[0].title).toBe("new title");
  });

  it("updates multiple fields", async () => {
    const saveTickets = vi.fn();

    await updateHandler("1", { title: "new", description: "new desc", priority: "high", dueby: "2026-08-01T00:00:00.000Z" }, {
      loadTickets: async () => [baseTicket],
      saveTickets,
      log: vi.fn(),
    });

    const saved = saveTickets.mock.calls[0][0];
    expect(saved[0].title).toBe("new");
    expect(saved[0].description).toBe("new desc");
    expect(saved[0].priority).toBe("high");
    expect(saved[0].dueby).toBe("2026-08-01T00:00:00.000Z");
  });

  it("fails when no update flags provided", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await updateHandler("1", {}, {
      loadTickets: async () => [baseTicket],
      saveTickets: vi.fn(),
      log: vi.fn(),
    });

    expect(errorSpy).toHaveBeenCalledWith("No updates provided. Use --title, --description, --priority, or --dueby");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("fails when ticket not found", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await updateHandler("999", { title: "x" }, {
      loadTickets: async () => [],
      saveTickets: vi.fn(),
      log: vi.fn(),
    });

    expect(errorSpy).toHaveBeenCalledWith("No ticket found with id 999");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/commands/update.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write `src/commands/update.ts`**

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/commands/update.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/commands/update.ts src/commands/update.test.ts
git commit -m "feat: add ticket update command"
```

---

### Task 6: status Handler

**Files:**
- Create: `src/commands/status.ts`
- Create: `src/commands/status.test.ts`

- [ ] **Step 1: Write `src/commands/status.test.ts`**

```typescript
import { describe, expect, it, vi } from "vitest";
import { statusHandler } from "./status.js";

describe("statusHandler", () => {
  it("changes status of a ticket", async () => {
    const saveTickets = vi.fn();
    const tickets = [{ id: 1, title: "test", description: "", status: "todo" as const, priority: "medium" as const, dueby: null }];

    await statusHandler("1", "done", { loadTickets: async () => tickets, saveTickets, log: vi.fn() });

    const saved = saveTickets.mock.calls[0][0];
    expect(saved[0].status).toBe("done");
  });

  it("fails when ticket not found", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await statusHandler("999", "done", { loadTickets: async () => [], saveTickets: vi.fn(), log: vi.fn() });

    expect(errorSpy).toHaveBeenCalledWith("No ticket found with id 999");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/commands/status.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write `src/commands/status.ts`**

```typescript
import type { Status, StatusHandlerDeps } from "../types.js";

export async function statusHandler(id: string, status: Status, deps: StatusHandlerDeps) {
  const { loadTickets, saveTickets, log = console.log } = deps;
  const tickets = await loadTickets();
  const ticket = tickets.find((t) => String(t.id) === id);

  if (!ticket) {
    console.error(`No ticket found with id ${id}`);
    process.exit(1);
    return;
  }

  ticket.status = status;
  await saveTickets(tickets);
  log(`Ticket ${id} status changed to ${status}: ${ticket.title}`);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/commands/status.test.ts
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/commands/status.ts src/commands/status.test.ts
git commit -m "feat: add ticket status command"
```

---

### Task 7: remove Handler

**Files:**
- Create: `src/commands/remove.ts`
- Create: `src/commands/remove.test.ts`

- [ ] **Step 1: Write `src/commands/remove.test.ts`**

```typescript
import { describe, expect, it, vi } from "vitest";
import { removeHandler } from "./remove.js";

describe("removeHandler", () => {
  it("removes a ticket by id", async () => {
    const saveTickets = vi.fn();
    const tickets = [
      { id: 1, title: "keep", description: "", status: "todo" as const, priority: "low" as const, dueby: null },
      { id: 2, title: "remove", description: "", status: "todo" as const, priority: "low" as const, dueby: null },
    ];

    await removeHandler("2", { loadTickets: async () => tickets, saveTickets, log: vi.fn() });

    const saved = saveTickets.mock.calls[0][0];
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe(1);
  });

  it("fails when ticket not found", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await removeHandler("999", { loadTickets: async () => [], saveTickets: vi.fn(), log: vi.fn() });

    expect(errorSpy).toHaveBeenCalledWith("No ticket found with id 999");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/commands/remove.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write `src/commands/remove.ts`**

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/commands/remove.test.ts
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/commands/remove.ts src/commands/remove.test.ts
git commit -m "feat: add ticket remove command"
```

---

### Task 8: search Handler

**Files:**
- Create: `src/commands/search.ts`
- Create: `src/commands/search.test.ts`

- [ ] **Step 1: Write `src/commands/search.test.ts`**

```typescript
import { describe, expect, it, vi } from "vitest";
import { searchHandler } from "./search.js";

const tickets = [
  { id: 1, title: "Fix login bug", description: "Users cannot log in", status: "todo" as const, priority: "high" as const, dueby: null },
  { id: 2, title: "Add dark mode", description: "UI improvement", status: "in_progress" as const, priority: "medium" as const, dueby: null },
  { id: 3, title: "Deploy", description: "Ship to production", status: "done" as const, priority: "low" as const, dueby: "2026-07-20T00:00:00.000Z" },
];

describe("searchHandler", () => {
  it("searches by text in title and description", async () => {
    const log = vi.fn();

    await searchHandler({ query: "login" }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("Fix login bug"));
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("Deploy"));
  });

  it("searches by id", async () => {
    const log = vi.fn();

    await searchHandler({ query: "3", id: true }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("Deploy"));
  });

  it("filters by priority", async () => {
    const log = vi.fn();

    await searchHandler({ query: "", priority: "high" }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("Fix login bug"));
  });

  it("filters by status", async () => {
    const log = vi.fn();

    await searchHandler({ query: "", status: "done" }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith(expect.stringContaining("Deploy"));
  });

  it("supports case-sensitive search", async () => {
    const log = vi.fn();

    await searchHandler({ query: "LOGIN", caseSensitive: true }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith("No tickets found.");
  });

  it("shows message when no results", async () => {
    const log = vi.fn();

    await searchHandler({ query: "nonexistent" }, { loadTickets: async () => tickets, log });

    expect(log).toHaveBeenCalledWith("No tickets found.");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/commands/search.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write `src/commands/search.ts`**

```typescript
import type { SearchHandlerDeps, SearchOptions } from "../types.js";

export async function searchHandler(options: SearchOptions, deps: SearchHandlerDeps) {
  const { query, id, priority, status, caseSensitive } = options;
  const { loadTickets, log = console.log } = deps;
  const tickets = await loadTickets();

  let filtered = tickets;

  if (id) {
    filtered = filtered.filter((t) => t.id.toString().includes(query));
  }

  if (query && !id) {
    filtered = filtered.filter((t) => {
      const haystack = caseSensitive
        ? t.title + t.description
        : (t.title + t.description).toLowerCase();
      const needle = caseSensitive ? query : query.toLowerCase();
      return haystack.includes(needle);
    });
  }

  if (priority) {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  if (filtered.length === 0) {
    log("No tickets found.");
    return;
  }

  for (const ticket of filtered) {
    log(`[${ticket.status}] ${ticket.id} (${ticket.priority}) - ${ticket.title} - ${ticket.description}`);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/commands/search.test.ts
```

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/commands/search.ts src/commands/search.test.ts
git commit -m "feat: add ticket search command"
```

---

### Task 9: Rewrite index.ts

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Rewrite `src/index.ts`**

```typescript
#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { input, select } from "@inquirer/prompts";
import { Command } from "commander";

import { addHandler } from "./commands/add.js";
import { listHandler } from "./commands/list.js";
import { showHandler } from "./commands/show.js";
import { updateHandler } from "./commands/update.js";
import { statusHandler } from "./commands/status.js";
import { removeHandler } from "./commands/remove.js";
import { searchHandler } from "./commands/search.js";

import { loadTickets, saveTickets, validatePriority, validateStatus } from "./tools/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(await readFile(join(__dirname, "..", "package.json"), "utf8"));
const program = new Command();

program.version(pkg.version);

program
  .name("dnt")
  .description("A small CLI for managing tickets")
  .option("-v, --verbose", "enable verbose logging")
  .hook("preAction", (thisCommand, _actionCommand) => {
    if (thisCommand.opts().verbose) {
      process.env.DNT_VERBOSE = "1";
    }
  });

program.addHelpText(
  "after",
  `
    Examples:
    $ dnt ticket add "Fix login bug" --priority high
    $ dnt ticket list
    $ dnt ticket status 42 done
    $ dnt ticket rm 42
  `,
);

const ticket = program.command("ticket").description("Manage tickets");

ticket
  .command("add [title]")
  .description("Add a new ticket")
  .option("-d, --description <text>", "description of the ticket")
  .option("-p, --priority [level]", "priority: low, medium, high", validatePriority)
  .option("-s, --status [level]", "status: todo, in_progress, done", validateStatus)
  .option("-b, --dueby <timestamp>", "due date (ISO 8601 timestamp)")
  .action(async (title, options) => {
    addHandler(title, options, {
      loadTickets,
      saveTickets,
      log: console.log,
      inputPrompt: input,
      selectPrompt: select,
    });
  });

ticket
  .command("list")
  .description("List tickets")
  .option("-a, --all", "include done tickets")
  .option("-s, --status <level>", "filter by status")
  .option("-p, --priority <level>", "filter by priority")
  .action(async (options) => listHandler(options, { loadTickets, log: console.log }));

ticket
  .command("show <id>")
  .description("Show ticket details")
  .action(async (id) => showHandler(id, { loadTickets, log: console.log }));

ticket
  .command("update <id>")
  .alias("edit")
  .description("Update ticket fields")
  .option("-t, --title <value>", "new title")
  .option("-d, --description <text>", "new description")
  .option("-p, --priority <level>", "priority: low, medium, high", validatePriority)
  .option("-b, --dueby <timestamp>", "due date (ISO 8601 timestamp)")
  .action(async (id, options) =>
    updateHandler(id, options, { loadTickets, saveTickets, log: console.log }),
  );

ticket
  .command("status <id> <status>")
  .description("Change ticket status (todo, in_progress, done)")
  .action(async (id, status) =>
    statusHandler(id, status, { loadTickets, saveTickets, log: console.log }),
  );

ticket
  .command("remove <id>")
  .alias("rm")
  .description("Delete a ticket")
  .action(async (id) => removeHandler(id, { loadTickets, saveTickets, log: console.log }));

ticket
  .command("search <query>")
  .alias("s")
  .description("Search tickets")
  .option("-t, --title", "search by title (default)")
  .option("-i, --id", "search by id")
  .option("-p, --priority <level>", "filter by priority")
  .option("-s, --status <level>", "filter by status")
  .option("-c, --case-sensitive", "enable case-sensitive search")
  .action(async (query, options) =>
    searchHandler({ query, ...options }, { loadTickets, log: console.log }),
  );

try {
  await program.parseAsync(process.argv);
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add grouped ticket commands to CLI"
```

---

### Task 10: Remove Old Files and Update package.json Description

**Files:**
- Delete: `src/commands/done.ts`
- Delete: `src/commands/undone.ts`
- Delete: `src/commands/done.test.ts`
- Delete: `src/commands/undone.test.ts`
- Delete: `src/commands/add.test.ts`
- Delete: `src/commands/list.test.ts`
- Delete: `src/commands/show.test.ts`
- Delete: `src/commands/edit.test.ts`
- Delete: `src/commands/remove.test.ts`
- Delete: `src/commands/search.test.ts`
- Delete: `.taskly.json`
- Modify: `package.json`

- [ ] **Step 1: Delete old handler files**

```bash
git rm src/commands/done.ts src/commands/undone.ts
git rm src/commands/done.test.ts src/commands/undone.test.ts
git rm src/commands/add.test.ts src/commands/list.test.ts src/commands/show.test.ts src/commands/edit.test.ts src/commands/remove.test.ts src/commands/search.test.ts
rm .taskly.json
```

- [ ] **Step 2: Update `package.json` description**

Change:
```json
"description": "A simple CLI task manager built with Commander.js",
```
To:
```json
"description": "A simple CLI for managing tickets",
```

- [ ] **Step 3: Run full check**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: all pass. If any old file still references old types, fix imports.

- [ ] **Step 4: Commit**

```bash
git add package.json
git rm src/commands/done.ts src/commands/undone.ts src/commands/done.test.ts src/commands/undone.test.ts src/commands/add.test.ts src/commands/list.test.ts src/commands/show.test.ts src/commands/edit.test.ts src/commands/remove.test.ts src/commands/search.test.ts
git commit -m "chore: remove old task handlers, update package description"
```
