import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-todo-stats',
  standalone: true,
  imports: [],
  templateUrl: './todo-stats.html',
})
export class TodoStats {
  @Input() total = 0;
  @Input() completed = 0;
  @Input() remaining = 0;
}
