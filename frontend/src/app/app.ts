import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  constructor(private themeService: ThemeService) {
    // Theme service initializes automatically in constructor
    // Injecting it here ensures it's initialized early
  }
}
