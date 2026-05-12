export async function addHandler(title, options, deps = {}) {
  const { loadTasks = defaultLoad, saveTasks = defaultSave, log = console.log } = deps;
  const tasks = await loadTasks();

  tasks.push({ id: Date.now(), title, priority: options.priority, done: false });

  await saveTasks(tasks);

  log(`Added: ${title}`);
}