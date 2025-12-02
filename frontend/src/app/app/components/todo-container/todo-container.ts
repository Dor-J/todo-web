import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingOverlay } from '../loading-overlay/loading-overlay';
import { ErrorBanner } from '../error-banner/error-banner';
import { TodoFilters } from '../todo/todo-filters/todo-filters';
import { TodoStats } from '../todo/todo-stats/todo-stats';
import { TodoForm } from '../todo/todo-form/todo-form';
import { TodoList } from '../todo/todo-list/todo-list';
import { TodoStore } from '../../../todo.store';
import type { Todo } from '../../../todo';
import type { TodoFiltersState } from '../../../models/filters';

@Component({
  selector: 'app-todo-container',
  standalone: true,
  imports: [CommonModule, LoadingOverlay, ErrorBanner, TodoFilters, TodoStats, TodoForm, TodoList],
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

  ngOnInit(): void {
    this.store.loadTodos();
  }

  handleCreate(payload: { title: string; description?: string; isCompleted?: boolean }): void {
    this.store.createTodo(payload);
  }

  handleToggle(todo: Todo): void {
    this.store.toggleComplete(todo);
  }

  handleEdit(todo: Todo): void {
    this.store.updateTodo(todo);
  }

  handleDelete(id: string): void {
    this.store.deleteTodo(id);
  }

  handleFiltersChange(filters: TodoFiltersState): void {
    this.store.setFilters(filters);
  }

  dismissToast(): void {
    this.store.clearToast();
  }

  dismissError(): void {
    this.store.clearError();
  }
}
