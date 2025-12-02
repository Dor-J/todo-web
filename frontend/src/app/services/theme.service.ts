import { Injectable, signal, effect } from '@angular/core';

/**
 * Service for managing application theme (light/dark mode).
 * Provides theme state management, persistence, and system preference detection.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private readonly isDarkMode = signal<boolean>(false);

  /**
   * Signal that exposes the current theme state.
   * Components can read this to reactively update their UI.
   */
  readonly theme = this.isDarkMode.asReadonly();

  constructor() {
    // Initialize theme on service creation
    this.initializeTheme();

    // Effect to apply theme class to HTML element when theme changes
    effect(() => {
      const isDark = this.isDarkMode();
      this.applyTheme(isDark);
    });
  }

  /**
   * Toggles between light and dark theme.
   */
  toggleTheme(): void {
    const newTheme = !this.isDarkMode();
    this.setTheme(newTheme);
  }

  /**
   * Sets the theme to the specified mode.
   * @param isDark - Whether to set dark mode (true) or light mode (false)
   */
  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    this.persistTheme(isDark);
  }

  /**
   * Initializes the theme on app startup.
   * Checks localStorage first, then falls back to system preference.
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    if (savedTheme) {
      // Use saved preference
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }
    
    // Apply theme immediately
    this.applyTheme(this.isDarkMode());
  }

  /**
   * Applies the theme class to the HTML element.
   * @param isDark - Whether to apply dark mode
   */
  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  /**
   * Persists the theme preference to localStorage.
   * @param isDark - Whether dark mode is enabled
   */
  private persistTheme(isDark: boolean): void {
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }
}

