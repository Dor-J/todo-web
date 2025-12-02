export type TodoFilterStatus = 'all' | 'active' | 'completed';

export interface TodoFiltersState {
  query: string;
  status: TodoFilterStatus;
}
