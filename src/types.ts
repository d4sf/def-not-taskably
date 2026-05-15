export interface Task {
  id: number;
  title: string;
  priority: Priority;
  done: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export interface ListOptions {
  all?: boolean;
  priority?: Priority;
}

export interface AddOptions {
  priority: Priority;
}

export interface HandlerDeps {
  loadTasks: () => Promise<Task[]>;
  saveTasks?: (tasks: Task[]) => Promise<void>;
  log?: (message: string) => void;
}

export interface HandlerDepsOptional {
  loadTasks?: () => Promise<Task[]>;
  saveTasks?: (tasks: Task[]) => Promise<void>;
  log?: (message: string) => void;
}