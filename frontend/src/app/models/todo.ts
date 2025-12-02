export interface Todo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
  completedAt?: string | null;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  starred?: boolean;
}
