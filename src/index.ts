#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { input, select } from "@inquirer/prompts";
import { Command } from "commander";

import { addHandler } from "./commands/add.js";
import { listHandler } from "./commands/list.js";
import { removeHandler } from "./commands/remove.js";
import { searchHandler } from "./commands/search.js";
import { showHandler } from "./commands/show.js";
import { statusHandler } from "./commands/status.js";
import { updateHandler } from "./commands/update.js";

import { date } from "./tools/date-prompt.js";
import { addTicket, deleteTicket, getTicketById, getTickets, updateTicket, validatePriority, validateStatus } from "./tools/index.js";

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
  .option("-b, --dueby [timestamp]", "due date (ISO 8601 timestamp)")
  .action(async (title, options) => {
    addHandler(title, options, {
      getTickets,
      getTicketById,
      addTicket,
      updateTicket,
      deleteTicket,
      log: console.log,
      inputPrompt: input,
      selectPrompt: select,
      datePrompt: date,
    });
  });

ticket
  .command("list")
  .description("List tickets")
  .option("-a, --all", "include done tickets")
  .option("-s, --status <level>", "filter by status")
  .option("-p, --priority <level>", "filter by priority")
  .action(async (options) => listHandler(options, { getTickets, getTicketById, log: console.log }));

ticket
  .command("show <id>")
  .alias("sh")
  .description("Show ticket details")
  .action(async (id) => showHandler(id, { getTickets, getTicketById, log: console.log }));

ticket
  .command("update <id>")
  .alias("edit")
  .description("Update ticket fields")
  .option("-t, --title <value>", "new title")
  .option("-d, --description <text>", "new description")
  .option("-p, --priority <level>", "priority: low, medium, high", validatePriority)
  .option("-b, --dueby <timestamp>", "due date (ISO 8601 timestamp)")
  .action(async (id, options) =>
    updateHandler(id, options, { getTickets, getTicketById, addTicket, updateTicket, deleteTicket, log: console.log }),
  );

ticket
  .command("status <id> <status>")
  .description("Change ticket status (todo, in_progress, done)")
  .action(async (id, status) =>
    statusHandler(id, status, { getTickets, getTicketById, addTicket, updateTicket, deleteTicket, log: console.log }),
  );

ticket
  .command("remove <id>")
  .alias("rm")
  .description("Delete a ticket")
  .action(async (id) => removeHandler(id, { getTickets, getTicketById, addTicket, updateTicket, deleteTicket, log: console.log }));

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
    searchHandler({ query, ...options }, { getTickets, getTicketById, log: console.log }),
  );

try {
  await program.parseAsync(process.argv);
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}
