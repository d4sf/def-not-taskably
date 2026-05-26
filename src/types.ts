import type { input, select } from '@inquirer/prompts';

export type Priority = 'low' | 'medium' | 'high';
export type InputPromptFunction = typeof input;
export type SelectPromptFunction = typeof select;

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  done: boolean;
}

export interface ListOptions {
  all?: boolean;
  priority?: Priority;
}

export interface PriorityPromptChoice {
  name:  string;
  value: Priority;
  description: string
}

export type AddOptions = Pick<Task, 'priority'> & Partial<Pick<Task, 'description'>>;
export type EditOptions = Partial<Pick<Task, 'title' | 'description' | 'priority'>>;

export interface HandlerDeps {
  log?: (message: string) => void;
}

/** Base interface for commands that only need to read tasks */
export interface TaskReadDeps extends HandlerDeps {
  loadTasks: () => Promise<Task[]>;
}

/** Base interface for commands that need to modify and save tasks */
export interface TaskWriteDeps extends TaskReadDeps {
  saveTasks: (tasks: Task[]) => Promise<void>;
}

/** Concrete definitions inheriting from base capabilities */
export interface AddHandlerDeps extends TaskWriteDeps {
  inputPrompt: InputPromptFunction,
  selectPrompt: SelectPromptFunction,
}

export interface RemoveHandlerDeps extends TaskWriteDeps {}
export interface DoneHandlerDeps extends TaskWriteDeps {}
export interface UndoneHandlerDeps extends TaskWriteDeps {}
export interface EditHandlerDeps extends TaskWriteDeps {}
export interface ListHandlerDeps extends TaskReadDeps {}
export interface SearchHandlerDeps extends TaskReadDeps {}
export interface ShowHandlerDeps extends TaskReadDeps {}

export interface SearchOptions {
  query: string;
  title?: boolean;
  id?: boolean;
  priority?: Priority;
  caseSensitive?: boolean;
}
