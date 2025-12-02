import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [],
  templateUrl: './error-banner.html',
})
export class ErrorBanner {
  @Input() message: string | null = null;
  @Output() dismiss = new EventEmitter<void>();
}
