import type { DoneHandlerDeps } from "../types.js";

/**
 * Marks a specific task as completed (done).
 *
 * This handler retrieves the current task list, locates the task by its ID,
 * updates the 'done' status to true, and persists the updated list to storage.
 *
 * @param id - The unique identifier of the task to be marked as done.
 * @param deps - Injected dependencies for task persistence and console logging.
 * @returns {Promise<void>} Resolves once the task is updated and saved.
 * @throws {never} Internal errors (like task not found) result in a process exit.
 */
export async function doneHandler(id: string, deps: DoneHandlerDeps) {
  const { loadTasks, saveTasks, log = console.log } = deps;
  const tasks = await loadTasks();
  const task = tasks.find((t) => String(t.id) === id);

  if (!task) {
    console.error(`No task found with id ${id}`);
    process.exit(1);
    return;
  }

  task.done = true;

  await saveTasks(tasks);

  log(`Marked as done: ${task.title}`);
}
