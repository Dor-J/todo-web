import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [],
  templateUrl: './loading-overlay.html',
})
export class LoadingOverlay {
  @Input() isLoading = false;
}
