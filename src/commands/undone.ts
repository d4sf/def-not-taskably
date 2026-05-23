import { UndoneHandlerDeps } from '../types.js';

/**
 * Marks a specific task as not completed (undone).
 * 
 * This handler retrieves the current task list, finds the task matching the provided ID,
 * sets its 'done' property to false, and persists the changes. 
 * 
 * @param id - The unique identifier of the task to update.
 * @param deps - The dependencies required for task operations, including load, save, and log functions.
 * @returns {Promise<void>} Resolves when the task has been updated and saved.
 * @throws {never} This function handles errors internally by logging and exiting the process.
 */
export async function undoneHandler(
  id: string,
  deps: UndoneHandlerDeps
) {
  const { loadTasks, saveTasks, log = console.log } = deps;
  const tasks = await loadTasks();
  const task = tasks.find((t) => String(t.id) === id);

  if (!task) {
    console.error(`No task found with id ${id}`);
    process.exit(1);
    return;
  }

  task.done = false;

  await saveTasks!(tasks);

  log(`Marked as not done: ${task.title}`);
}