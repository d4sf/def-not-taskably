export async function doneHandler(id, deps = {}) {
  const { loadTasks = defaultLoad, saveTasks = defaultSave, log = console.log } = deps;
  const tasks = await loadTasks();
  const task = tasks.find((t) => String(t.id) === id);

  if (!task) {
    console.error(`No task found with id ${id}`);
    process.exit(1);
    return;
  }

  task.done  = true;

  await saveTasks(tasks);

  log(`Marked as done: ${task.title}`);
}