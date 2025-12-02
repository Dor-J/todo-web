import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { TodoStore } from '../../../todo.store';
import { TodoFormService } from '../../../services/todo-form.service';

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [],
  templateUrl: './header-bar.html',
})
export class HeaderBar {
  readonly themeService = inject(ThemeService);
  private readonly todoStore = inject(TodoStore);
  private readonly todoFormService = inject(TodoFormService);

  /**
   * Toggles between light and dark theme.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Refreshes the todo list by reloading todos from the API.
   */
  refreshTodos(): void {
    this.todoStore.loadTodos();
  }

  /**
   * Focuses the todo form input field.
   */
  focusTodoForm(): void {
    this.todoFormService.requestFocus();
  }
}
