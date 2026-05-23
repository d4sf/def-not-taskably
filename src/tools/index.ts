import { resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { Task, Priority } from '../types.js';

const TASK_FILE = resolve(process.cwd(), '.taskly.json');

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

export async function saveTasks(tasks: Task[]): Promise<void> {
  await writeFile(TASK_FILE, JSON.stringify(tasks, null, 2));
}

export function validatePriority(value: string): Priority {
  const allowed: Priority[] = ['low', 'medium', 'high'];

  if (!allowed.includes(value as Priority)) {
    throw new Error(`Priority must be one of: ${allowed.join(', ')}`);
  }

  return value as Priority;
}