// frontend/src/app/models/todo.model.ts

export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TodoStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export interface Todo {
  /** Stable unique identifier (GUID/string from backend) */
  id: string;

  /** Owner / creator (multi-user, JWT subject) */
  ownerId: string;

  /** Short summary of the task */
  title: string;

  /** Optional long-form description */
  description?: string | null;

  /**
   * Legacy convenience flag for UI.
   * Should be derived from `status === 'COMPLETED'` on the backend.
   */
  isCompleted: boolean;

  /** Canonical state for the item */
  status: TodoStatus;

  /** Priority for sorting & triage (default: MEDIUM) */
  priority: TodoPriority;

  /** Whether the item is pinned/important for the user */
  starred: boolean;

  /** Optional due date (ISO string) used for reminders/overdue logic */
  dueDate?: string | null;

  /** Optional labels/tags for grouping and filtering */
  tags?: string[];

  /** Soft-delete flag; keep for audit/logs instead of hard-deleting */
  isDeleted?: boolean;

  /** When the todo was soft-deleted (if applicable) */
  deletedAt?: string | null;

  /** When the todo was completed (if applicable) */
  completedAt?: string | null;

  /** When the todo was created (server time, ISO 8601) */
  createdAt: string;

  /** When the todo was last updated (server time, ISO 8601) */
  updatedAt?: string | null;

  /** Optional order index for manual sorting inside a list/board */
  sortOrder?: number | null;

  /**
   * Free-form metadata the backend might attach for integrations,
   * without breaking the core contract.
   */
  metadata?: Record<string, unknown>;
}
