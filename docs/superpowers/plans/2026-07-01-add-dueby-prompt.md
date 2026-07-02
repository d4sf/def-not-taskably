# Add Dueby Prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive prompt for `dueby` using `@inquirer/date` in the `add` command's interactive mode, and make `--dueby` an optional flag that triggers the prompt.

**Architecture:** Add `datePrompt` to `AddHandlerDeps`, install `@inquirer/date`, update the handler logic to prompt for dueby in interactive mode or when `--dueby` is passed as a flag.

**Tech Stack:** TypeScript 6, ESM, @inquirer/date, Commander.js

**Files modified:**
- `package.json` — add `@inquirer/date` dep
- `src/types.ts` — add `DatePromptFunction` type, add `datePrompt` to `AddHandlerDeps`
- `src/commands/add.ts` — update `ticketDueby` logic
- `src/commands/add.test.ts` — update tests for new dep
- `src/index.ts` — change `--dueby` to optional value, pass `datePrompt`

---

### Task 1: Add Dueby Prompt

- [ ] **Step 1: Install `@inquirer/date`**

```bash
npm install @inquirer/date
```

- [ ] **Step 2: Update `src/types.ts`**

Add after `SelectPromptFunction`:

```typescript
import type { date } from "@inquirer/date";
export type DatePromptFunction = typeof date;
```

Add `datePrompt` to `AddHandlerDeps`:

```typescript
export interface AddHandlerDeps extends TicketWriteDeps {
  inputPrompt: InputPromptFunction;
  selectPrompt: SelectPromptFunction;
  datePrompt: DatePromptFunction;
}
```

- [ ] **Step 3: Update `src/commands/add.test.ts`**

Add `datePrompt: vi.fn()` to all existing test calls to `addHandler`. Then add two new tests at the end:

```typescript
it("prompts for dueby in interactive mode", async () => {
  const saveTickets = vi.fn();
  const inputPrompt = vi.fn().mockResolvedValueOnce("My Ticket");
  const selectPrompt = vi.fn().mockResolvedValueOnce("medium");
  const datePrompt = vi.fn().mockResolvedValueOnce(new Date("2026-07-15T12:00:00.000Z"));

  await addHandler(
    undefined,
    {},
    {
      loadTickets: async () => [],
      saveTickets,
      log: vi.fn(),
      inputPrompt,
      selectPrompt,
      datePrompt,
    },
  );

  expect(datePrompt).toHaveBeenCalledTimes(1);
  const saved = saveTickets.mock.calls[0][0];
  expect(saved[0].dueby).toBe("2026-07-15T12:00:00.000Z");
});

it("skips dueby when user cancels date prompt", async () => {
  const saveTickets = vi.fn();
  const inputPrompt = vi.fn().mockResolvedValueOnce("My Ticket");
  const selectPrompt = vi.fn().mockResolvedValueOnce("medium");
  const datePrompt = vi.fn().mockResolvedValueOnce(undefined);

  await addHandler(
    undefined,
    {},
    {
      loadTickets: async () => [],
      saveTickets,
      log: vi.fn(),
      inputPrompt,
      selectPrompt,
      datePrompt,
    },
  );

  const saved = saveTickets.mock.calls[0][0];
  expect(saved[0].dueby).toBeNull();
});
```

- [ ] **Step 4: Run tests to verify the new tests fail**

```bash
npx vitest run src/commands/add.test.ts
```

Expected: FAIL — 2 new tests fail (datePrompt not accepted by handler), possibly a type error.

- [ ] **Step 5: Update `src/commands/add.ts`**

Change the `ticketDueby` assignment:

```typescript
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
    return options.dueby;
  })();
```

Add `datePrompt` to the destructured deps:

```typescript
  const { inputPrompt, selectPrompt, datePrompt } = deps;
```

- [ ] **Step 6: Update `src/index.ts`**

Change `--dueby` from required to optional value:

```typescript
.option("-b, --dueby [timestamp]", "due date (ISO 8601 timestamp)")
```

Add `@inquirer/date` import:

```typescript
import { date } from "@inquirer/date";
```

Add `datePrompt: date` to the `addHandler` deps:

```typescript
addHandler(title, options, {
  loadTickets,
  saveTickets,
  log: console.log,
  inputPrompt: input,
  selectPrompt: select,
  datePrompt: date,
});
```

- [ ] **Step 7: Run tests to verify everything passes**

```bash
npx vitest run src/commands/add.test.ts
```

Expected: PASS (6 tests).

- [ ] **Step 8: Run full verification**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add package.json src/types.ts src/commands/add.ts src/commands/add.test.ts src/index.ts
git commit -m "feat: add interactive dueby prompt with @inquirer/date"
```
