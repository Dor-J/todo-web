// frontend/src/app/models/todo-update.dto.ts

import type { TodoPriority, TodoStatus } from './todo.model';

export interface UpdateTodoDto {
  /** Patchable core fields */
  title?: string;
  description?: string | null;

  /** State machine fields */
  status?: TodoStatus;
  isCompleted?: boolean;

  /** Planning / organization */
  dueDate?: string | null;
  priority?: TodoPriority;
  starred?: boolean;
  tags?: string[];
  sortOrder?: number | null;

  /** Completion / deletion lifecycle */
  completedAt?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;

  /**
   * For audit; in a strict setup backend overrides this
   * with server time and ignores client value.
   */
  updatedAt?: string | null;

  /** Same idea as in create */
  metadata?: Record<string, unknown>;
}

