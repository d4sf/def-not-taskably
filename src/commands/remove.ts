import type { RemoveHandlerDeps } from "../types.js";

/**
 * Removes a task from the list by its unique identifier.
 *
 * This handler loads all tasks, filters out the one matching the provided ID,
 * and saves the remaining list. If no matching task is found, it logs an error
 * and terminates the process.
 *
 * @param id - The unique identifier of the task to be removed.
 * @param deps - Injected dependencies for file operations and logging.
 * @returns {Promise<void>} Resolves when the task is successfully removed and the file updated.
 */
export async function removeHandler(id: string, deps: RemoveHandlerDeps) {
  const { loadTasks, saveTasks, log = console.log } = deps;
  const tasks = await loadTasks();
  const next = tasks.filter((task) => String(task.id) !== id);

  if (next.length === tasks.length) {
    console.error(`No tasks found with id ${id}`);
    process.exit(1);
    return;
  }

  await saveTasks(next);

  log(`Removed task ${id}`);
}
