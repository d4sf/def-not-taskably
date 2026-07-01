#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { input, select } from "@inquirer/prompts";
import { Command } from "commander";

import { addHandler } from "./commands/add.js";
import { doneHandler } from "./commands/done.js";
import { editHandler } from "./commands/edit.js";
import { listHandler } from "./commands/list.js";
import { removeHandler } from "./commands/remove.js";
import { searchHandler } from "./commands/search.js";
import { showHandler } from "./commands/show.js";
import { undoneHandler } from "./commands/undone.js";

import { loadTasks, saveTasks, validatePriority } from "./tools/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(await readFile(join(__dirname, "..", "package.json"), "utf8"));
const program = new Command();

program.version(pkg.version);

program
  .name("dnt")
  .description("A small CLI for managing local task lists")
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
    $ dnt add "Write tests" --priority high
    $ dnt list --all
    $ dnt done 169999999
    $ dnt rm 169999999
  `,
);

program
  .command("add [title]")
  .description("Add a new task")
  .option("-d, --description <text>", "description of the task")
  .option("-p, --priority [level]", "priority: low, medium, high", validatePriority)
  .action(async (title, options) => {
    addHandler(title, options, {
      loadTasks,
      saveTasks,
      log: console.log,
      inputPrompt: input,
      selectPrompt: select,
    });
  });

program
  .command("list")
  .description("Show all tasks")
  .option("-a, --all", "include completed tasks")
  .option("-p, --priority <level>", "filter by priority")
  .action(async (options) => listHandler(options, { loadTasks, log: console.log }));

program
  .command("done <id>")
  .description("Mark a task as completed")
  .action(async (id) => doneHandler(id, { loadTasks, saveTasks, log: console.log }));

program
  .command("remove <id>")
  .alias("rm")
  .description("Delete a task")
  .action(async (id) => removeHandler(id, { loadTasks, saveTasks, log: console.log }));

program
  .command("undone <id>")
  .alias("ud")
  .description("Mark a task as not completed")
  .action(async (id) => undoneHandler(id, { loadTasks, saveTasks, log: console.log }));

program
  .command("edit <id>")
  .alias("update")
  .description("Edit a task")
  .option("-t, --title <value>", "new title")
  .option("-d, --description <text>", "new description")
  .option("-p, --priority <level>", "priority: low, medium, high", validatePriority)
  .action(async (id, options) =>
    editHandler(id, options, { loadTasks, saveTasks, log: console.log }),
  );

program
  .command("search <query>")
  .alias("s")
  .description("Search tasks by title, id, or priority")
  .usage("dnt search <query> [-t] [-i] [-p <level>] [-c]")
  .option("-t, --title", "search by title (default)")
  .option("-i, --id", "search by id (cannot be combined with -t or -p)")
  .option("-p, --priority <level>", "search by priority (low, medium, high)", validatePriority)
  .option("-c, --case-sensitive", "enable case-sensitive title search")
  .action(async (query, options) =>
    searchHandler({ query, ...options }, { loadTasks, log: console.log }),
  );

program
  .command("show <id>")
  .alias("sh")
  .description("Show task details")
  .action(async (id) => showHandler(id, { loadTasks, log: console.log }));

try {
  await program.parseAsync(process.argv);
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}
