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

export interface EditOptions {
  title?: string;
  priority?: Priority;
}

export interface HandlerDeps {
  log?: (message: string) => void;
}

export interface AddHandlerDeps extends HandlerDeps {
  loadTasks: () => Promise<Task[]>;
  saveTasks: (tasks: Task[]) => Promise<void>;
}

export interface RemoveHandlerDeps extends AddHandlerDeps {}

export interface DoneHandlerDeps extends AddHandlerDeps {}

export interface UndoneHandlerDeps extends AddHandlerDeps {}

export interface EditHandlerDeps extends AddHandlerDeps {}

export interface ListHandlerDeps extends HandlerDeps {
  loadTasks: () => Promise<Task[]>;
}