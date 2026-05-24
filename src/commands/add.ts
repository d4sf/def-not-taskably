import { AddHandlerDeps, AddOptions, Task, TaskWriteDeps } from '../types.js';
import { priorityPromptChoices } from '../tools/index.js';

/**
 * Creates and persists a new task in the task list.
 * 
 * This handler resolves task details by checking provided CLI arguments and options first.
 * If information is missing, it utilizes interactive prompts to gather the necessary data.
 * It then constructs a new Task object with a unique timestamp-based ID and persists it.
 * 
 * @param title - The name or summary of the task. If undefined, the user will be prompted.
 * @param options - Configuration for the new task, including priority and optional description.
 * @param deps - Injected dependencies for task loading, saving, and logging.
 * @returns {Promise<void>} Resolves once the new task is successfully saved to the file.
 */
export async function addHandler(
  title: string | undefined,
  options: Partial<AddOptions>,
  deps: AddHandlerDeps
) {
  const { inputPrompt, selectPrompt } = deps;
  
  const taskTitle = title || await inputPrompt({
    message: "Enter the title:",
    default: "New Task",
    required: true
  });

  const taskDescription = options.description ?? (
    title ? '' : await inputPrompt({ message: "Enter the description (optional):", default: "" })
  );

  const taskPriority = options.priority || (
    title ? 'medium' : await selectPrompt({
      message: 'Choose a priority:',
      choices: priorityPromptChoices,
      default: 'medium'
    })
  );

  const newTask: Task = {
    id: Date.now(),
    title: taskTitle,
    description: taskDescription,
    priority: taskPriority,
    done: false
  };

  const tasks = await deps.loadTasks();

  await saveTask(newTask, tasks, deps);
}

/**
 * Updates the task list in memory, persists it to storage, and provides feedback to the user.
 * 
 * @param task - The newly created task object to be added.
 * @param tasks - The current collection of tasks retrieved from storage.
 * @param deps - The write dependencies including the save function and logger.
 * @returns {Promise<void>}
 */
async function saveTask(task: Task, tasks: Task[], deps: TaskWriteDeps) {
  const { saveTasks, log = console.log } = deps;

  tasks.push(task);
  await saveTasks(tasks);
  log(`Added: ${task.title}${task.description ? ` - ${task.description}` : ''}`);
}