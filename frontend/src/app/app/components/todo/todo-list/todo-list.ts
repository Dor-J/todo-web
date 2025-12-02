import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TodoListItem } from '../todo-list-item/todo-list-item';
import type { Todo } from '../../../../todo';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoListItem],
  templateUrl: './todo-list.html',
})
export class TodoList {
  @Input() todos: Todo[] = [];
  @Output() toggleTodo = new EventEmitter<Todo>();
  @Output() editTodo = new EventEmitter<Todo>();
  @Output() deleteTodo = new EventEmitter<string>();
}
