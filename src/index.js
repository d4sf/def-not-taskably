#!/usr/bin/env node

import { Command } from 'commander';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { addHandler } from './commands/add.js';
import { listHandler } from './commands/list.js';
import { doneHandler } from './commands/done.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  await readFile(join(__dirname, '..', 'package.json'), 'utf8')
);
const TASK_FILE = resolve(process.cwd(), '.taskly.json');
const program = new Command();

async function loadTasks() {
  try {
    const data = await readFile(TASK_FILE, 'utf-8');

    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function validatePriority(value) {
  const allowed = ['low', 'medium', 'high'];

  if (!allowed.includes(value)) {
    throw new Error(`Priority must be one of: ${allowed.join(', ')}`);
  }

  return value;
}

async function saveTasks(tasks) {
  await writeFile(TASK_FILE, JSON.stringify(tasks, null, 2));
}

program.version(pkg.version);

program
  .name('taskly')
  .description('A small CLI for managing local task lists')
  .option('-v, --verbose', 'enable verbose logging')
  .hook('preAction', (thisCommand, actionCommand) => {
    if (thisCommand.opts().verbose) {
      process.env.TASKLY_VERBOSE = '1';
    }
  });

program.addHelpText('after', `
    Examples:
    $ taskly add "Write tests" --priority high
    $ taskly list --all
    $ taskly done 169999999
    $ taskly rm 169999999
  `);

program
  .command('add <title>')
  .description('Add a new task')
  .option('-p, --priority <level>', 'priority: low, medium, high',
    validatePriority, 'medium')
  .action(async (title, options) => {
    if (title.trim().length === 0) {
      console.error('Task title cannot be empty');

      process.exitCode = 1;
      return;
    }

    addHandler(title, options, { loadTasks, saveTasks });
  });

program
  .command('list')
  .description('Show all tasks')
  .option('-a, --all', 'include completed tasks')
  .option('-p, --priority <level>', 'filter by priority')
  .action(async (options) =>
    listHandler(options, { loadTasks })
  );

program
  .command('done <id>')
  .description('Mark a task as completed')
  .action(async (id) =>
    doneHandler(id, { loadTasks, saveTasks })
  );

program
  .command('remove <id>')
  .alias('rm')
  .description('Delete a task')
  .action(async (id) => {
    const tasks = await loadTasks();
    const next = tasks.filter((task) => String(task.id) !== id);

    if (next.length === tasks.length) {
      console.error(`No tasks found with id ${id}`);
      process.exitCode = 1;
      return;
    }

    await saveTasks(next);

    console.log(`Removed task ${id}`);
  });

try {
  await program.parseAsync(process.argv);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exitCode = 1;
}
