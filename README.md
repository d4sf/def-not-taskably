# dnt

A small CLI for managing tickets. Tickets have a title, description, status (`todo`, `in_progress`, `done`), priority, and an optional due date.

## Installation

```bash
npm install -g dnt
```

## Usage

All commands are grouped under `dnt ticket`:

```bash
dnt ticket add "Fix login bug" --priority high
dnt ticket list
dnt ticket status 42 done
dnt ticket rm 42
```

## Commands

### `dnt ticket add [title]`

Add a new ticket. If no title is provided, interactive prompts guide you through the fields.

| Option | Description |
|--------|-------------|
| `-d, --description <text>` | Description of the ticket |
| `-p, --priority [level]` | Priority: `low`, `medium`, `high` (default: `medium`) |
| `-s, --status [level]` | Status: `todo`, `in_progress`, `done` (default: `todo`) |
| `-b, --dueby [timestamp]` | Due date (ISO 8601). Pass as flag to trigger interactive prompt |

Examples:
```bash
dnt ticket add "Write docs"
dnt ticket add "Deploy" --priority high --status in_progress --dueby 2026-07-20
dnt ticket add                    # interactive mode
```

### `dnt ticket list`

List tickets. By default hides done tickets.

| Option | Description |
|--------|-------------|
| `-a, --all` | Include done tickets |
| `-s, --status <level>` | Filter by status |
| `-p, --priority <level>` | Filter by priority |

Examples:
```bash
dnt ticket list
dnt ticket list --all
dnt ticket list --status in_progress --priority high
```

### `dnt ticket show <id>`

Show full ticket details (title, description, status, priority, due date, ID).

Alias: `dnt sh <id>`

### `dnt ticket update <id>`

Update ticket fields. Requires at least one option.

Alias: `dnt edit <id>`

| Option | Description |
|--------|-------------|
| `-t, --title <value>` | New title |
| `-d, --description <text>` | New description |
| `-p, --priority <level>` | New priority |
| `-b, --dueby <timestamp>` | New due date |

Examples:
```bash
dnt ticket update 42 --title "New name" --priority high
dnt ticket update 42 --dueby 2026-08-01
```

### `dnt ticket status <id> <status>`

Change ticket status. Valid statuses: `todo`, `in_progress`, `done`.

```bash
dnt ticket status 42 done
dnt ticket status 42 in_progress
```

### `dnt ticket remove <id>`

Delete a ticket by ID.

Alias: `dnt rm <id>`

### `dnt ticket search <query>`

Search tickets by text, ID, priority, or status.

Alias: `dnt ticket s <query>`

| Option | Description |
|--------|-------------|
| `-t, --title` | Search by title (default) |
| `-i, --id` | Search by ID |
| `-p, --priority <level>` | Filter by priority |
| `-s, --status <level>` | Filter by status |
| `-c, --case-sensitive` | Case-sensitive search |

Examples:
```bash
dnt ticket search login
dnt ticket search 42 --id
dnt ticket search "bug" --priority high --status todo
dnt ticket search "Bug" --case-sensitive
```

## Options

- `-v, --verbose` — Enable verbose logging

## Ticket Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Auto-generated timestamp |
| `title` | string | Ticket name |
| `description` | string | Detailed description |
| `status` | `todo` / `in_progress` / `done` | Current status |
| `priority` | `low` / `medium` / `high` | Priority level (default: `medium`) |
| `dueby` | ISO 8601 string or `null` | Optional due date |

## Storage

Tickets are stored in a `.magnetar.db` (SQLite) file in the current working directory.

## Development

### Native (requires Node >= 20.12)

```bash
npm install
npm run dev       # run with tsx
npm run typecheck # type check only
npm run lint      # lint with Biome
npm run build     # compile to dist/
npm test          # run tests
```

### Docker (no Node required)

```bash
docker compose build
```

| Comando | Propósito |
|---------|-----------|
| `docker compose run --rm dnt` | Ayuda del CLI |
| `docker compose run --rm dnt ticket list` | Ejecutar CLI (compilado) |
| `docker compose run --rm dnt tsx src/index.ts ticket list` | Modo dev con tsx |
| `docker compose run --rm dnt npm test` | Tests |
| `docker compose run --rm dnt npm run typecheck` | Type check |
| `docker compose run --rm dnt npm run lint` | Lint |
| `docker compose run --rm dnt npm run build` | Recompilar |

La base de datos `.magnetar.db` se crea en el directorio actual del host automáticamente.
