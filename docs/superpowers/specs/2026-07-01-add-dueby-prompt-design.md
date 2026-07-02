# Add Dueby Prompt Design

## Goal

Add an interactive prompt for `dueby` in the `add` command when no title argument is provided, using `@inquirer/date`.

## Design

### Types (`src/types.ts`)

Add `DatePromptFunction`:

```typescript
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

### Dependencies

Install `@inquirer/date`:

```
npm install @inquirer/date
```

### Handler (`src/commands/add.ts`)

Replace the current `ticketDueby` line with logic that handles three modes:

```typescript
const ticketDueby = (() => {
  if (options.dueby === undefined) {
    // --dueby not passed at all
    // Non-interactive: null; Interactive: prompt
    if (title) return null;
    return (await datePrompt({ message: "Due date (optional):", default: undefined }))
      ?.toISOString() ?? null;
  }
  if (options.dueby === true) {
    // --dueby passed as flag without value → always prompt
    return (await datePrompt({ message: "Due date:", default: undefined }))
      ?.toISOString() ?? null;
  }
  // --dueby passed with value
  return options.dueby;
})();
```

`@inquirer/date` returns a `Date` object when answered, or `undefined` if skipped (Ctrl+C). Convert to ISO string or null.

### CLI (`src/index.ts`)

Change `--dueby` from required `<timestamp>` to optional `[timestamp]` so it can be used as a flag:

```typescript
.option("-b, --dueby [timestamp]", "due date (ISO 8601 timestamp)")
```

When passed without value, Commander sets it to `true`. The handler checks:
- `options.dueby === undefined` → not passed, use `null` (non-interactive) or prompt (interactive)
- `options.dueby === true` → flag passed without value, prompt for date
- `options.dueby` is a string → use it directly

Pass `datePrompt` in deps:

```typescript
addHandler(title, options, {
  loadTickets,
  saveTickets,
  log: console.log,
  inputPrompt: input,
  selectPrompt: select,
  datePrompt: date,  // from @inquirer/date
});
```

### Tests

Update `add.test.ts`:
- Add `datePrompt: vi.fn()` to all existing test deps
- Add test: interactive mode prompts for dueby and sets it
- Add test: interactive mode skips dueby when cancelled
- Ensure non-interactive mode never calls datePrompt

### Files changed

- Modify: `src/types.ts`
- Modify: `src/commands/add.ts`
- Modify: `src/commands/add.test.ts`
- Modify: `src/index.ts`
- Modify: `package.json` (new dep)
