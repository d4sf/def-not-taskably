import { resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { Task, Priority } from '../types.js';

const TASK_FILE = resolve(process.cwd(), '.taskly.json');

/**
 * Reads and parses the task list from the local `.taskly.json` file.
 * 
 * If the file does not exist (ENOENT), it returns an empty array.
 * It maps over the tasks to ensure every task has a 'description' property,
 * providing a default empty string if it's missing from the stored JSON.
 * @returns {Promise<Task[]>} A promise that resolves to the array of tasks.
 */
export async function loadTasks(): Promise<Task[]> {
  try {
    const data = await readFile(TASK_FILE, 'utf-8');
    const tasks = JSON.parse(data) as any[];

    return tasks.map(t => ({ description: '', ...t })) as Task[];
  } catch (error) {
    if (error instanceof Error && (error as { code?: string }).code === 'ENOENT') return [];
    throw error;
  }
}

/**
 * Persists the current task list to the local `.taskly.json` file.
 * 
 * @param {Task[]} tasks - The array of task objects to save.
 * @returns {Promise<void>}
 */
export async function saveTasks(tasks: Task[]): Promise<void> {
  await writeFile(TASK_FILE, JSON.stringify(tasks, null, 2));
}

/**
 * Validates a string input against the allowed task priority levels.
 * 
 * @param {string} value - The input value to validate (typically from CLI options).
 * @returns {Priority} The validated priority string.
 * @throws {Error} If the value is not one of 'low', 'medium', or 'high'.
 */
export function validatePriority(value: string): Priority {
  const allowed: Priority[] = ['low', 'medium', 'high'];

  if (!allowed.includes(value as Priority)) {
    throw new Error(`Priority must be one of: ${allowed.join(', ')}`);
  }

  return value as Priority;
}