export async function addHandler(title: string, options: any, deps: any = {}) {
  const { loadTasks , saveTasks, log = console.log } = deps;
  const tasks = await loadTasks();

  tasks.push({ id: Date.now(), title, priority: options.priority, done: false });

  await saveTasks(tasks);

  log(`Added: ${title}`);
}