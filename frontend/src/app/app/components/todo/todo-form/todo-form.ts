import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { getValidationErrorMessage, noWhitespaceValidator } from '../validators';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-form.html',
})
export class TodoForm {
  @Output() save = new EventEmitter<{ title: string; description?: string; isCompleted?: boolean }>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120), noWhitespaceValidator()]],
    description: ['', [Validators.maxLength(1000)]],
    isCompleted: [false],
  });

  /**
   * Gets the validation error message for a form control
   */
  getErrorMessage(control: AbstractControl | null, fieldName: string): string | null {
    return getValidationErrorMessage(control, fieldName);
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
    this.form.reset({ title: '', description: '', isCompleted: false });
  }
}
