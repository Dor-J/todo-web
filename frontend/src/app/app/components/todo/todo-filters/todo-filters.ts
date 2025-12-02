import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoFiltersState, TodoFilterStatus } from '../../../../models/filters';

@Component({
  selector: 'app-todo-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './todo-filters.html',
})
export class TodoFilters {
  @Input() filters: TodoFiltersState = { query: '', status: 'all' };
  @Output() filtersChange = new EventEmitter<TodoFiltersState>();

  updateQuery(query: string): void {
    this.filtersChange.emit({ ...this.filters, query });
  }

  setStatus(status: TodoFilterStatus): void {
    this.filtersChange.emit({ ...this.filters, status });
  }
}
