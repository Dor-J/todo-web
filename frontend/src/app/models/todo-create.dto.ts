export interface CreateTodoDto {
  title: string;
  description?: string;
  isCompleted?: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  starred?: boolean;
}
