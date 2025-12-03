import { Injectable, computed, signal } from '@angular/core';
import { TodoService, type CreateTodoDto, type UpdateTodoDto, type Todo } from '../app/todo';
import { TodoFiltersState } from '../app/models/filters';

type PendingAction = 'load' | 'create' | 'update' | 'delete' | null;

@Injectable({
  providedIn: 'root',
})
export class TodoStore {
  private readonly service: TodoService;

  constructor(service: TodoService) {
    this.service = service;
  }

  private readonly todos = signal<Todo[]>([]);
  readonly filters = signal<TodoFiltersState>({ query: '', status: 'all', isStarred: 'all', priority: 'all', sortBy: 'updatedAt' });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);
  readonly pendingAction = signal<PendingAction>(null);

  readonly filteredTodos = computed(() => {
    const { query, status, isStarred, priority, sortBy } = this.filters();
    const q = query.trim().toLowerCase();
    const filtered = this.todos().filter((todo) => {
      const matchesQuery =
        !q ||
        todo.title.toLowerCase().includes(q) ||
        (todo.description ?? '').toLowerCase().includes(q);
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && !todo.isCompleted) ||
        (status === 'completed' && todo.isCompleted);
      const matchesStarred =
        !isStarred || isStarred === 'all' ||
        (isStarred === 'starred' && todo.starred === true) ||
        (isStarred === 'not-starred' && (todo.starred === false || todo.starred === undefined));
      const matchesPriority =
        !priority || priority === 'all' || (todo.priority?.toUpperCase() === priority);
      return matchesQuery && matchesStatus && matchesStarred && matchesPriority;
    });

    const sortOption = sortBy ?? 'updatedAt';
    return [...filtered].sort((a, b) => {
      if (sortOption === 'priority') {
        const priorityWeight = (p?: string): number => {
          if (!p) return 1; // MEDIUM weight for missing priority
          const upper = p.toUpperCase();
          if (upper === 'HIGH') return 3;
          if (upper === 'MEDIUM') return 2;
          if (upper === 'LOW') return 1;
          return 1;
        };
        const priorityDiff = priorityWeight(b.priority) - priorityWeight(a.priority);
        if (priorityDiff !== 0) return priorityDiff;
        // Tiebreaker: sort by updatedAt descending
        const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return bDate - aDate;
      } else if (sortOption === 'createdAt') {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      } else {
        // updatedAt (default)
        const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return bDate - aDate;
      }
    });
  });

  readonly stats = computed(() => {
    const total = this.todos().length;
    const completed = this.todos().filter((t) => t.isCompleted).length;
    const remaining = total - completed;
    return { total, completed, remaining };
  });

  loadTodos(): void {
    this.loading.set(true);
    this.pendingAction.set('load');
    this.service.getTodos().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.error.set(null);
      },
      error: (err) => {
        this.handleError(err);
      },
      complete: () => this.finishAction(),
    });
  }

  createTodo(payload: CreateTodoDto): void {
    this.pendingAction.set('create');
    this.service.addTodo({ ...payload, isCompleted: payload.isCompleted ?? false }).subscribe({
      next: (todo) => {
        this.todos.update((list) => [...list, todo]);
        this.toast.set('Todo created');
        this.error.set(null);
      },
      error: (err) => this.handleError(err),
      complete: () => this.finishAction(),
    });
  }

  toggleComplete(todo: Todo): void {
    const updated: Todo = {
      ...todo,
      isCompleted: !todo.isCompleted,
      updatedAt: new Date().toISOString(),
      completedAt: !todo.isCompleted ? new Date().toISOString() : null,
    };
    this.commitUpdate(todo.id, updated);
  }

  updateTodo(todo: Todo): void {
    const updated: Todo = {
      ...todo,
      updatedAt: new Date().toISOString(),
    };
    this.commitUpdate(todo.id, updated);
  }

  deleteTodo(id: string): void {
    const previous = this.todos();
    this.todos.set(previous.filter((t) => t.id !== id));
    this.pendingAction.set('delete');
    this.service.deleteTodo(id).subscribe({
      next: () => {
        this.toast.set('Todo deleted');
        this.error.set(null);
      },
      error: (err) => {
        this.todos.set(previous);
        this.handleError(err);
      },
      complete: () => this.finishAction(),
    });
  }

  setFilters(filters: TodoFiltersState): void {
    this.filters.set(filters);
  }

  clearToast(): void {
    this.toast.set(null);
  }

  clearError(): void {
    this.error.set(null);
  }

  private commitUpdate(id: string, updated: Todo): void {
    const previous = this.todos();
    this.todos.set(previous.map((t) => (t.id === id ? updated : t)));
    this.pendingAction.set('update');
    const dto: UpdateTodoDto = {
      title: updated.title,
      description: updated.description,
      isCompleted: updated.isCompleted,
      completedAt: updated.completedAt,
      updatedAt: updated.updatedAt,
      priority: updated.priority,
      starred: updated.starred,
    };
    this.service.updateTodo(id, dto).subscribe({
      next: (serverTodo) => {
        this.todos.set(this.todos().map((t) => (t.id === id ? serverTodo : t)));
        this.toast.set('Todo updated');
        this.error.set(null);
      },
      error: (err) => {
        this.todos.set(previous);
        this.handleError(err);
      },
      complete: () => this.pendingAction.set(null),
    });
  }

  private finishAction(): void {
    this.pendingAction.set(null);
    this.loading.set(false);
  }

  private handleError(err: unknown): void {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    this.error.set(message);
    this.finishAction();
  }
}
