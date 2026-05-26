# dnt

A simple CLI task manager built with Commander.js.

## Installation

```bash
npm install -g dnt
```

## Usage

Add a task:
```bash
dnt add "Buy groceries" --priority high
```

List tasks:
```bash
dnt list
dnt list --all            # include completed tasks
dnt list --priority high
```

Show task details:
```bash
dnt show <id>
dnt sh <id>
```

Mark task as done / not done:
```bash
dnt done <id>
dnt undone <id>
dnt ud <id>
```

Edit a task:
```bash
dnt edit <id> --title "New title" --priority low
dnt update <id> --description "Updated description"
```

Remove a task:
```bash
dnt remove <id>
dnt rm <id>
```

Search tasks:
```bash
dnt search <query>
dnt s <query>
dnt search <query> --priority high
dnt search <query> --case-sensitive
dnt search <id> --id
```

## Options

- `-v, --verbose` - Enable verbose logging

## Commands

| Command | Alias | Description |
|---|---|---|
| `add <title>` | | Add a new task |
| `list` | | Show all tasks |
| `show <id>` | `sh` | Show task details |
| `done <id>` | | Mark a task as completed |
| `undone <id>` | `ud` | Mark a task as not completed |
| `edit <id>` | `update` | Edit a task |
| `remove <id>` | `rm` | Delete a task |
| `search <query>` | `s` | Search tasks |

## Priority Levels

- `low`
- `medium` (default)
- `high`

## Testing

```bash
npm test
```
