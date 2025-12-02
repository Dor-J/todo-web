import { Component } from '@angular/core';
import { LoadingOverlay } from '../loading-overlay/loading-overlay';
import { ErrorBanner } from '../error-banner/error-banner';
import { TodoFilters } from '../todo/todo-filters/todo-filters';
import { TodoStats } from '../todo/todo-stats/todo-stats';
import { TodoForm } from '../todo/todo-form/todo-form';
import { TodoList } from '../todo/todo-list/todo-list';

@Component({
  selector: 'app-todo-container',
  standalone: true,
  imports: [LoadingOverlay, ErrorBanner, TodoFilters, TodoStats, TodoForm, TodoList],
  templateUrl: './todo-container.html',
})
export class TodoContainer {}
