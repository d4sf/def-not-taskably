#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import { Command } from "commander";

function showError(message) {
  console.error(chalk.red.bold(`Error: ${message}`));
  process.exit(1);
}

const program = new Command();
const validTypes = ['default', 'important', 'urgent'];

program
  .name('my-cli')
  .description('A CLI application built with Commander.js')
  .version('1.0.0')
  .option('-d, --debug', 'output extra debugging information')
  .option('-f, --file <path>', 'specify the file to process')
  .option('-t, --timeout <seconds>', 'specify the timeout in seconds', '60')
  .option('-v, --verbose', 'increase output verbosity');

program
  .command('list')
  .description('List all items')
  .option('-a, --all', 'list all items, including hidden ones')
  .action((options) => {
    console.log('Listing all items...');

    if (options.all) {
      console.log('Including hidden items')
    }
  });

program
  .command('create')
  .description('Create a new item')
  // .option('-t, --type <type>', 'specify the item type', 'default')
  .action(async () => {

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the item name: ',
        validate: (input) => input.length >= 3 ? true : 'Name must be at least 3 characters long'
      },
      {
        type: 'select',
        name: 'type',
        message: 'Select the item type: ',
        choices: ['default', 'important', 'urgent']
      }
    ]);

    console.log(chalk.green(`Successfully created item "${answers.name}" of type "${answers.type}"`));
  });

program.parse()

const options = program.opts();

if (options.debug) {
  console.log('Debug mode, mate');
  console.log('Options:', options);
}