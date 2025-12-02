import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Todo } from '../../../../todo';

@Component({
  selector: 'app-todo-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-list-item.html',
})
export class TodoListItem {
  @Input({ required: true }) todo!: Todo;
  @Output() toggle = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
