import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.html',
})
export class Toast {
  @Input() message: string | null = null;
  @Output() dismiss = new EventEmitter<void>();
}
