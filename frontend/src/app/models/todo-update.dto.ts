export interface UpdateTodoDto {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  completedAt?: string | null;
  updatedAt?: string | null;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  starred?: boolean;
}
