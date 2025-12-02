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
   * Toggles between light and dark theme.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
