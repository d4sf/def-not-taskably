# Taskly

A simple CLI task manager built with Commander.js.

## Installation

```bash
npm install
```

## Usage

Add a task:
```bash
taskly add "Buy groceries" --priority high
```

List tasks:
```bash
taskly list
taskly list --all      # include completed tasks
taskly list --priority high
```

Mark task as done:
```bash
taskly done <id>
```

Remove a task:
```bash
taskly remove <id>
taskly rm <id>
```

## Options

- `-v, --verbose` - Enable verbose logging

## Commands

- `add <title>` - Add a new task
- `list` - Show all tasks
- `done <id>` - Mark a task as completed
- `remove <id>` - Delete a task (alias: `rm`)

## Priority Levels

- `low`
- `medium` (default)
- `high`

## Testing

```bash
npm test
```