import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TodoListItem } from '../todo-list-item/todo-list-item';
import type { Todo } from '../../../../services/todo.service';
import { CommonModule } from '@angular/common';
import type { TodoFiltersState, TodoSortOption } from '../../../../models/filters';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoListItem],
  templateUrl: './todo-list.html',
})
export class TodoList {
  @Input() todos: Todo[] = [];
  @Input() filters: TodoFiltersState = {
    query: '',
    status: 'all',
    isStarred: 'all',
    priority: 'all',
    sortBy: 'updatedAt',
  };
  @Output() toggleTodo = new EventEmitter<Todo>();
  @Output() editTodo = new EventEmitter<Todo>();
  @Output() deleteTodo = new EventEmitter<string>();
  @Output() toggleStarred = new EventEmitter<Todo>();
  @Output() sortByChange = new EventEmitter<TodoSortOption>();

  setSortBy(sortBy: TodoSortOption): void {
    this.sortByChange.emit(sortBy);
  }
}
