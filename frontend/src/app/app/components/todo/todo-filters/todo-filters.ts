import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TodoFiltersState, TodoFilterStatus, TodoFilterStarred, TodoFilterPriority } from '../../../../models/filters';

@Component({
  selector: 'app-todo-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './todo-filters.html',
})
export class TodoFilters implements OnDestroy {
  @Input() filters: TodoFiltersState = { query: '', status: 'all', isStarred: 'all', priority: 'all' };
  @Output() filtersChange = new EventEmitter<TodoFiltersState>();

  private readonly querySubject = new Subject<string>();

  constructor() {
    // Debounce query updates by 300ms
    this.querySubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        this.filtersChange.emit({ ...this.filters, query });
      });
  }

  updateQuery(query: string): void {
    this.querySubject.next(query);
  }

  setStatus(status: TodoFilterStatus): void {
    this.filtersChange.emit({ ...this.filters, status });
  }

  setStarred(status: TodoFilterStarred): void {
    this.filtersChange.emit({ ...this.filters, isStarred: status });
  }

  setPriority(priority: TodoFilterPriority): void {
    this.filtersChange.emit({ ...this.filters, priority });
  }

  ngOnDestroy(): void {
    this.querySubject.complete();
  }
}
