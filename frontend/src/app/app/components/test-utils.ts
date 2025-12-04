// Import DOM matchers for all tests
import '@testing-library/jest-dom/vitest';

import { signal, computed, type WritableSignal } from '@angular/core';
import { of, throwError, type Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import type { Todo } from '../../models/todo.model';
import type {  TodoService } from '../../services/todo.service';
import type { CreateTodoDto } from '../../models/todo-create.dto';
import type { UpdateTodoDto } from '../../models/todo-update.dto';
import type { TodoFiltersState } from '../../models/filters';
import { TodoStore } from '../../../store/todo.store';
import { TodoFormService } from '../../services/todo-form.service';

/**
 * Creates a mock Todo object for testing
 */
export function createMockTodo(overrides?: Partial<Todo>): Todo {
  const now = new Date().toISOString();
  return {
    id: 'test-id-1',
    title: 'Test Todo',
    description: 'Test description',
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    priority: 'MEDIUM',
    starred: false,
    ...overrides,
  };
}

/**
 * Creates a mock TodoFiltersState for testing
 */
export function createMockFilters(overrides?: Partial<TodoFiltersState>): TodoFiltersState {
  return {
    query: '',
    status: 'all',
    isStarred: 'all',
    priority: 'all',
    sortBy: 'updatedAt',
    ...overrides,
  };
}

/**
 * Creates a mock TodoService for testing
 */
export function createMockTodoService(overrides?: {
  getTodos?: () => Observable<Todo[]>;
  addTodo?: (todo: CreateTodoDto) => Observable<Todo>;
  updateTodo?: (id: string, payload: UpdateTodoDto) => Observable<Todo>;
  deleteTodo?: (id: string) => Observable<void>;
}): Partial<TodoService> {
  const defaultTodos: Todo[] = [
    createMockTodo({ id: '1', title: 'Todo 1' }),
    createMockTodo({ id: '2', title: 'Todo 2', isCompleted: true }),
  ];

  return {
    getTodos: overrides?.getTodos ?? (() => of(defaultTodos)),
    addTodo:
      overrides?.addTodo ??
      ((todo: CreateTodoDto) =>
        of({
          ...createMockTodo(),
          ...todo,
          id: `new-${Date.now()}`,
          createdAt: new Date().toISOString(),
        })),
    updateTodo:
      overrides?.updateTodo ??
      ((id: string, payload: UpdateTodoDto) =>
        of({
          ...createMockTodo({ id }),
          ...payload,
        } as Todo)),
    deleteTodo: overrides?.deleteTodo ?? (() => of(undefined)),
  };
}

/**
 * Creates a mock TodoFormService for testing
 */
export function createMockTodoFormService(): {
  service: TodoFormService;
  requestFocus: () => void;
} {
  const focusRequest$ = new Subject<void>();
  const service = {
    focusRequest: focusRequest$.asObservable(),
    requestFocus: () => focusRequest$.next(),
  } as unknown as TodoFormService;

  return {
    service,
    requestFocus: () => focusRequest$.next(),
  };
}

/**
 * Creates a mock TodoStore for testing
 */
export function createMockTodoStore(initialState?: {
  todos?: Todo[];
  filters?: TodoFiltersState;
  loading?: boolean;
  error?: string | null;
  toast?: string | null;
}): {
  store: Partial<TodoStore>;
  setTodos: (todos: Todo[]) => void;
  setFilters: (filters: TodoFiltersState) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setToast: (toast: string | null) => void;
} {
  const todosSignal = signal<Todo[]>(initialState?.todos ?? []);
  const filtersSignal = signal<TodoFiltersState>(initialState?.filters ?? createMockFilters());
  const loadingSignal = signal<boolean>(initialState?.loading ?? false);
  const errorSignal = signal<string | null>(initialState?.error ?? null);
  const toastSignal = signal<string | null>(initialState?.toast ?? null);

  const filteredTodos = computed(() => {
    const { query, status, isStarred, priority, sortBy } = filtersSignal();
    const q = query.trim().toLowerCase();
    const filtered = todosSignal().filter((todo) => {
      const matchesQuery =
        !q ||
        todo.title.toLowerCase().includes(q) ||
        (todo.description ?? '').toLowerCase().includes(q);
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && !todo.isCompleted) ||
        (status === 'completed' && todo.isCompleted);
      const matchesStarred =
        !isStarred ||
        isStarred === 'all' ||
        (isStarred === 'starred' && todo.starred === true) ||
        (isStarred === 'not-starred' && (todo.starred === false || todo.starred === undefined));
      const matchesPriority =
        !priority || priority === 'all' || todo.priority?.toUpperCase() === priority;
      return matchesQuery && matchesStatus && matchesStarred && matchesPriority;
    });

    const sortOption = sortBy ?? 'updatedAt';
    return [...filtered].sort((a, b) => {
      if (sortOption === 'priority') {
        const priorityWeight = (p?: string): number => {
          if (!p) return 1;
          const upper = p.toUpperCase();
          if (upper === 'HIGH') return 3;
          if (upper === 'MEDIUM') return 2;
          if (upper === 'LOW') return 1;
          return 1;
        };
        const priorityDiff = priorityWeight(b.priority) - priorityWeight(a.priority);
        if (priorityDiff !== 0) return priorityDiff;
        const aDate = a.updatedAt
          ? new Date(a.updatedAt).getTime()
          : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
        const bDate = b.updatedAt
          ? new Date(b.updatedAt).getTime()
          : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;
        return bDate - aDate;
      } else if (sortOption === 'createdAt') {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      } else {
        const aDate = a.updatedAt
          ? new Date(a.updatedAt).getTime()
          : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
        const bDate = b.updatedAt
          ? new Date(b.updatedAt).getTime()
          : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;
        return bDate - aDate;
      }
    });
  });

  const stats = computed(() => {
    const total = todosSignal().length;
    const completed = todosSignal().filter((t) => t.isCompleted).length;
    const remaining = total - completed;
    return { total, completed, remaining };
  });

  const loadTodosSpy = vi.fn();
  const createTodoSpy = vi.fn();
  const toggleCompleteSpy = vi.fn();
  const updateTodoSpy = vi.fn();
  const deleteTodoSpy = vi.fn();
  const setFiltersSpy = vi.fn();
  const clearToastSpy = vi.fn();
  const clearErrorSpy = vi.fn();

  const store: Partial<TodoStore> = {
    filteredTodos,
    stats,
    loading: loadingSignal,
    error: errorSignal,
    toast: toastSignal,
    filters: filtersSignal,
    loadTodos: loadTodosSpy,
    createTodo: createTodoSpy,
    toggleComplete: toggleCompleteSpy,
    updateTodo: updateTodoSpy,
    deleteTodo: deleteTodoSpy,
    setFilters: setFiltersSpy,
    clearToast: clearToastSpy,
    clearError: clearErrorSpy,
  };

  return {
    store,
    setTodos: (todos: Todo[]) => todosSignal.set(todos),
    setFilters: (filters: TodoFiltersState) => filtersSignal.set(filters),
    setLoading: (loading: boolean) => loadingSignal.set(loading),
    setError: (error: string | null) => errorSignal.set(error),
    setToast: (toast: string | null) => toastSignal.set(toast),
  };
}
