import { Component, inject, signal, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import { TodoStore } from '../../../todo.store';
import { TodoFormService } from '../../../services/todo-form.service';
import { HealthIndicator } from '../health-indicator/health-indicator';

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [HealthIndicator],
  templateUrl: './header-bar.html',
})
export class HeaderBar {
  readonly themeService = inject(ThemeService);
  private readonly todoStore = inject(TodoStore);
  private readonly todoFormService = inject(TodoFormService);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Signal to track whether the mobile menu is open.
   */
  readonly menuOpen = signal(false);

  /**
   * Toggles the mobile menu open/closed state.
   */
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /**
   * Closes the mobile menu.
   */
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /**
   * Handles theme toggle from mobile menu and closes the menu.
   */
  handleThemeToggle(): void {
    this.toggleTheme();
    this.closeMenu();
  }

  /**
   * Handles refresh from mobile menu and closes the menu.
   */
  handleRefresh(): void {
    this.refreshTodos();
    this.closeMenu();
  }

  /**
   * Handles focus todo form from mobile menu and closes the menu.
   */
  handleFocusTodoForm(): void {
    this.focusTodoForm();
    this.closeMenu();
  }

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

  /**
   * Closes the menu when Escape key is pressed.
   */
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event): void {
    if (this.menuOpen()) {
      event.preventDefault();
      this.closeMenu();
    }
  }

  /**
   * Closes the menu when window is resized to desktop size.
   */
  @HostListener('window:resize')
  handleResize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Close menu if window is resized to desktop size (>= 768px)
    if (window.innerWidth >= 768 && this.menuOpen()) {
      this.closeMenu();
    }
  }
}
