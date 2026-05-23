import { SearchOptions, SearchHandlerDeps } from '../types.js';

/**
 * Executes a search against the task list based on provided criteria.
 * 
 * The search logic supports several modes:
 * 1. **ID Search**: Partial match against task IDs. Note that the `-i` flag is 
 *    mutually exclusive with title (`-t`) and priority (`-p`) filters.
 * 2. **Text Search**: Matches the query against both 'title' and 'description'. 
 *    This is the default mode and supports an optional case-sensitivity flag (`-c`).
 * 3. **Priority Filtering**: Narrow down results to a specific priority level.
 * 
 * If no tasks match the criteria, a "No tasks found" message is displayed.
 * 
 * @param options - The search configuration including query, filter flags, and case sensitivity.
 * @param deps - Injected dependencies for loading tasks and logging output.
 * @returns {Promise<void>}
 */
export async function searchHandler(
  options: SearchOptions,
  deps: SearchHandlerDeps
) {
  const { query, title, id, priority, caseSensitive } = options;
  const { loadTasks, log = console.log } = deps;
  const tasks = await loadTasks();

  if (id && (title || priority)) {
    log('Error: -i flag cannot be combined with -t or -p');
    return;
  }

  let filtered = tasks;

  if (id) {
    filtered = tasks.filter(task => 
      task.id.toString().includes(query)
    );
  } else {
    const useTitleSearch = !id && (title || !priority);
    
    if (useTitleSearch) {
      filtered = filtered.filter(task => {
        const match = caseSensitive
          ? task.title.includes(query) || task.description.includes(query)
          : task.title.toLowerCase().includes(query.toLowerCase()) || task.description.toLowerCase().includes(query.toLowerCase());
        
        return match;
      });
    }

    if (priority) {
      filtered = filtered.filter(task => task.priority === priority);
    }
  }

  if (filtered.length === 0) {
    log('No tasks found.');
    return;
  }

  for (const task of filtered) {
    const status = task.done ? '[x]' : '[ ]';
    log(`${status} ${task.id} (${task.priority}) - ${task.title} - ${task.description}`);
  }
}