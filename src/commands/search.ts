import { SearchOptions, SearchHandlerDeps } from '../types.js';

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