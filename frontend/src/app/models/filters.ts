export type TodoFilterStatus = 'all' | 'active' | 'completed';
export type TodoFilterStarred = 'all' | 'starred' | 'not-starred';
export type TodoFilterPriority = 'all' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TodoFiltersState {
  query: string;
  status: TodoFilterStatus;
  isStarred?: TodoFilterStarred;
  priority?: TodoFilterPriority;
}
