import { ListOptions, ListHandlerDeps } from '../types.js';

/**
 * Displays the list of tasks to the console with optional filtering.
 * 
 * This handler implements the following logic:
 * 1. **Completion Filter**: By default, only shows incomplete tasks. The 'all' option overrides this.
 * 2. **Priority Filter**: If a priority is specified, it narrows results to that specific level.
 * 3. **Formatting**: Displays status, ID, priority, and title. 
 * 4. **Truncation**: If a task has a description, it is displayed on a second line, truncated to 40 characters.
 * 
 * @param options - Configuration for filtering the list (all tasks, specific priority).
 * @param deps - Injected dependencies for data retrieval and output logging.
 * @returns {Promise<void>}
 */
export async function listHandler(
  options: ListOptions,
  deps: ListHandlerDeps
) {
  const { loadTasks, log = console.log } = deps;
  const tasks = await loadTasks();
  const filtered = tasks
    .filter((task) => options.all || !task.done)
    .filter((task) => !options.priority || task.priority === options.priority);

  if (filtered.length === 0) {
    log('No tasks found.');
    return;
  }

  for (const task of filtered) {
    const status = task.done ? '[x]' : '[ ]';
    log(`${status} ${task.id} (${task.priority}) - ${task.title}`);
    if (task.description) {
      const truncated = task.description.length > 40
        ? task.description.slice(0, 37) + '...'
        : task.description;
      log(`   ${truncated}`);
    }
  }
}