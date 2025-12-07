// frontend/src/app/models/todo-create.dto.ts

import type { TodoPriority, TodoStatus } from './todo.model';

export interface CreateTodoDto {
  /** Required minimal input */
  title: string;

  /** Optional free-text description */
  description?: string | null;

  /** Optional initial status (backend should default to 'PENDING') */
  status?: TodoStatus;

  /**
   * Convenience flag for old flows.
   * Backend should derive this from status if both are present.
   */
  isCompleted?: boolean;

  /** Optional scheduling info */
  dueDate?: string | null;

  /** Priority; backend should default to 'MEDIUM' if omitted */
  priority?: TodoPriority;

  /** Pin/important flag */
  starred?: boolean;

  /** Optional tags/labels for filtering/grouping */
  tags?: string[];

  /**
   * Optional manual ordering inside a list/board.
   * If omitted, backend can assign based on position.
   */
  sortOrder?: number | null;

  /**
   * Free-form metadata for integrations / custom attributes.
   * Backend can validate or ignore unknown keys.
   */
  metadata?: Record<string, unknown>;
}
