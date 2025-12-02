import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.html',
})
export class Toast implements OnChanges, OnDestroy {
  @Input() message: string | null = null;
  @Output() dismiss = new EventEmitter<void>();
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ('message' in changes) {
      this.resetTimer();
      if (this.message) {
        this.startTimer();
      }
    }
  }

  ngOnDestroy(): void {
    this.resetTimer();
  }

  private startTimer(): void {
    this.dismissTimer = setTimeout(() => this.dismiss.emit(), 2000);
  }

  private resetTimer(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
}
