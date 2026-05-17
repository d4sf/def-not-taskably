import { UndoneHandlerDeps } from '../types.js';

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