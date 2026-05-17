import { EditOptions, EditHandlerDeps } from '../types.js';

export async function editHandler(
  id: string,
  options: EditOptions,
  deps: EditHandlerDeps
) {
  const { loadTasks, saveTasks, log = console.log } = deps;
  const { title, priority } = options;

  if (!title && !priority) {
    console.error('No updates provided. Use --title or --priority');
    process.exit(1);
    return;
  }

  const tasks = await loadTasks();
  const task = tasks.find((t) => String(t.id) === id);

  if (!task) {
    console.error(`No task found with id ${id}`);
    process.exit(1);
    return;
  }

  if (title) {
    if (title.trim().length === 0) {
      console.error('Title cannot be empty');
      process.exit(1);
      return;
    }
    task.title = title;
  }

  if (priority) {
    task.priority = priority;
  }

  await saveTasks!(tasks);

  const updates: string[] = [];
  if (title) updates.push('title');
  if (priority) updates.push('priority');

  log(`Updated ${updates.join(' and ')} for task ${id}: ${task.title}`);
}