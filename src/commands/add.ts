import { AddHandlerDeps, AddOptions } from '../types.js';

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