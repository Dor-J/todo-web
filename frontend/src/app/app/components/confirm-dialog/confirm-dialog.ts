import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  @Input() visible = false;
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmLabel = 'Delete';
  @Input() cancelLabel = 'Cancel';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
