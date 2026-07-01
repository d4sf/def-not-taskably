import type { ShowHandlerDeps } from "../types.js";

/**
 * Displays the complete details of a single task.
 *
 * This handler retrieves the task list, searches for a task matching the provided ID,
 * and prints its properties (ID, Title, Description, Priority, and Status) to the console.
 * If the task is not found, it logs an error and terminates the process.
 *
 * @param id - The unique identifier of the task to display.
 * @param deps - Injected dependencies for loading tasks and logging output.
 * @returns {Promise<void>}
 * @throws {never} Internal errors (task not found) result in a process exit.
 */
export async function showHandler(id: string, deps: ShowHandlerDeps) {
  const { loadTasks, log = console.log } = deps;
  const tasks = await loadTasks();
  const task = tasks.find((t) => String(t.id) === id);

  if (!task) {
    console.error(`No task found with id ${id}`);
    process.exit(1);
    return;
  }

  log(`ID: ${task.id}`);
  log(`Title: ${task.title}`);
  log(`Description: ${task.description || "(none)"}`);
  log(`Priority: ${task.priority}`);
  log(`Done: ${task.done ? "Yes" : "No"}`);
}
