import { AddHandlerDeps, AddOptions } from '../types.js';

/**
 * Creates and persists a new task in the task list.
 * 
 * This handler generates a unique identifier using the current timestamp,
 * constructs a new task with the provided metadata, and appends it to the 
 * storage. If no description is provided in options, it defaults to an empty string.
 * 
 * @param title - The name or summary of the task.
 * @param options - Configuration for the new task, including priority and optional description.
 * @param deps - Injected dependencies for task loading, saving, and logging.
 * @returns {Promise<void>} Resolves once the new task is successfully saved to the file.
 */
export async function addHandler(
  title: string,
  options: AddOptions,
  deps: AddHandlerDeps
) {
  const { loadTasks, saveTasks, log = console.log } = deps;
  const tasks = await loadTasks();

  tasks.push({ id: Date.now(), title, description: options.description ?? '', priority: options.priority, done: false });

  await saveTasks(tasks);

  log(`Added: ${title}`);
}