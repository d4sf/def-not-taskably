export async function listHandler(options, deps = {}) {
  const { loadTasks = defaultLoad, log = console.log } = deps;
  const tasks = await loadTasks();

  const filtered = tasks
    .filter((task) => options.all || !task.done)
    .filter((task) => !options.priority || task.priority === options.priority);

  if (filtered.length === 0) {
    console.log('No tasks found.');
    return;
  }

  for (const task of filtered) {
    const status = task.done ? '[x]' : '[ ]';
    console.log(`${status} ${task.id} (${task.priority}) - ${task.title}`);
  }
}