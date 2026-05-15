import { Task, RemoveHandlerDeps } from '../types.js';

export async function removeHandler(
  id: string,
  deps: RemoveHandlerDeps
) {
  const { loadTasks, saveTasks, log = console.log } = deps;
  const tasks = await loadTasks();
  const next = tasks.filter((task) => String(task.id) !== id);

  if (next.length === tasks.length) {
    console.error(`No tasks found with id ${id}`);
    process.exit(1);
    return;
  }

  await saveTasks!(next);

  log(`Removed task ${id}`);
}