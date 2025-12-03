import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Todo } from '../../../../todo';
import { getValidationErrorMessage, noWhitespaceValidator } from '../validators';

export interface TodoEditPayload {
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  starred: boolean;
}

@Component({
  selector: 'app-todo-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-edit-modal.html',
})
export class TodoEditModal implements OnChanges {
  @Input() todo: Todo | null = null;
  @Output() dismiss = new EventEmitter<void>();
  @Output() save = new EventEmitter<TodoEditPayload>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120), noWhitespaceValidator()]],
    description: ['', [Validators.maxLength(1000)]],
    isCompleted: [false],
    priority: ['MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW'],
    starred: [false],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todo']) {
      if (this.todo) {
        this.form.reset({
          title: this.todo.title,
          description: this.todo.description ?? '',
          isCompleted: this.todo.isCompleted,
          priority: (this.todo.priority?.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW') ?? 'MEDIUM',
          starred: this.todo.starred,
        });
      } else {
        this.form.reset({
          title: '',
          description: '',
          isCompleted: false,
          priority: 'MEDIUM',
          starred: false,
        });
      }
    }
  }

  /**
   * Gets the validation error message for a form control
   */
  getErrorMessage(control: AbstractControl | null, fieldName: string): string | null {
    return getValidationErrorMessage(control, fieldName);
  }

  close(): void {
    this.dismiss.emit();
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
  }
}
