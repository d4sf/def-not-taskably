import type { EditHandlerDeps, EditOptions } from "../types.js";

/**
 * Updates the properties of an existing task based on provided options.
 *
 * This handler performs the following operations:
 * 1. **Option Validation**: Ensures that at least one update field (title, description, or priority) is present.
 * 2. **Task Retrieval**: Loads the task list and locates the target task by ID.
 * 3. **Content Validation**: Verifies that new titles or descriptions are not empty or purely whitespace.
 * 4. **Persistence**: Updates the task fields and saves the modified list back to storage.
 * 5. **Reporting**: Logs a summary of which specific fields were updated.
 *
 * @param id - The unique identifier of the task to edit.
 * @param options - An object containing the fields to update (title, description, priority).
 * @param deps - Injected dependencies for data operations and logging.
 * @returns {Promise<void>}
 * @throws {never} Handles errors internally via console.error and process.exit(1).
 */
export async function editHandler(id: string, options: EditOptions, deps: EditHandlerDeps) {
  const { loadTasks, saveTasks, log = console.log } = deps;
  const { title, description, priority } = options;

  if (!title && !description && !priority) {
    console.error("No updates provided. Use --title, --description, or --priority");
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
      console.error("Title cannot be empty");
      process.exit(1);
      return;
    }
    task.title = title;
  }

  if (description) {
    if (description.trim().length === 0) {
      console.error("Description cannot be empty");
      process.exit(1);
      return;
    }
    task.description = description;
  }

  if (priority) {
    task.priority = priority;
  }

  await saveTasks(tasks);

  const updates: string[] = [];

  if (title) updates.push("title");
  if (description) updates.push("description");
  if (priority) updates.push("priority");

  log(`Updated ${updates.join(" and ")} for task ${id}: ${task.title}`);
}
