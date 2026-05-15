import { ListOptions, ListHandlerDeps } from '../types.js';

export async function listHandler(
  options: ListOptions,
  deps: ListHandlerDeps
) {
  const { loadTasks, log = console.log } = deps;
  const tasks = await loadTasks();

  const filtered = tasks
    .filter((task) => options.all || !task.done)
    .filter((task) => !options.priority || task.priority === options.priority);

  if (filtered.length === 0) {
    log('No tasks found.');
    return;
  }

  for (const task of filtered) {
    const status = task.done ? '[x]' : '[ ]';
    log(`${status} ${task.id} (${task.priority}) - ${task.title}`);
  }
}