import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [],
  templateUrl: './header-bar.html',
})
export class HeaderBar {
  constructor(readonly themeService: ThemeService) {}

  /**
   * Gets the current theme state.
   * @returns true if dark mode is enabled, false otherwise
   */
  get isDarkMode(): boolean {
    return this.themeService.theme();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
