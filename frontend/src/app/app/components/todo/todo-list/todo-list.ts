import { Component } from '@angular/core';
import { TodoListItem } from '../todo-list-item/todo-list-item';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [TodoListItem],
  templateUrl: './todo-list.html',
})
export class TodoList {}
