import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingOverlay } from '../loading-overlay/loading-overlay';
import { ErrorBanner } from '../error-banner/error-banner';
import { TodoFilters } from '../todo/todo-filters/todo-filters';
import { TodoStats } from '../todo/todo-stats/todo-stats';
import { TodoForm } from '../todo/todo-form/todo-form';
import { TodoList } from '../todo/todo-list/todo-list';
import { TodoStore } from '../../../../store/todo.store';
import type { Todo } from '../../../services/todo.service';
import type { TodoFiltersState, TodoSortOption } from '../../../models/filters';
import { TodoEditModal, type TodoEditPayload } from '../todo/todo-edit-modal/todo-edit-modal';

@Component({
  selector: 'app-todo-container',
  standalone: true,
  imports: [
    CommonModule,
    LoadingOverlay,
    ErrorBanner,
    TodoFilters,
    TodoStats,
    TodoForm,
    TodoList,
    TodoEditModal,
  ],
  templateUrl: './todo-container.html',
})
export class TodoContainer implements OnInit {
  private readonly store = inject(TodoStore);
  readonly filteredTodos = this.store.filteredTodos;
  readonly stats = this.store.stats;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly toast = this.store.toast;
  readonly filters = this.store.filters;
  readonly editingTodo = signal<Todo | null>(null);

  ngOnInit(): void {
    this.store.loadTodos();
  }

  handleCreate(payload: {
    title: string;
    description?: string;
    isCompleted?: boolean;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    starred?: boolean;
  }): void {
    this.store.createTodo(payload);
  }

  handleToggle(todo: Todo): void {
    this.store.toggleComplete(todo);
  }

  handleEdit(todo: Todo): void {
    this.editingTodo.set(todo);
  }

  saveEdit(payload: TodoEditPayload): void {
    const active = this.editingTodo();
    if (!active) {
      return;
    }
    const updated: Todo = {
      ...active,
      title: payload.title,
      description: payload.description?.trim() ? payload.description.trim() : undefined,
      isCompleted: payload.isCompleted,
      priority: payload.priority,
      starred: payload.starred,
    };
    this.store.updateTodo(updated);
    this.editingTodo.set(null);
  }

  dismissEdit(): void {
    this.editingTodo.set(null);
  }

  handleDelete(id: string): void {
    this.store.deleteTodo(id);
  }

  handleFiltersChange(filters: TodoFiltersState): void {
    this.store.setFilters(filters);
  }

  handleSortByChange(sortBy: TodoSortOption): void {
    const currentFilters = this.filters();
    this.store.setFilters({ ...currentFilters, sortBy });
  }

  dismissToast(): void {
    this.store.clearToast();
  }

  dismissError(): void {
    this.store.clearError();
  }

  handleToggleStarred(todo: Todo): void {
    const updated: Todo = {
      ...todo,
      starred: !(todo.starred ?? false),
    };
    this.store.updateTodo(updated);
  }
}
