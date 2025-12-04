import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Todo } from '../../../../services/todo.service';
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
export class TodoEditModal implements OnChanges, AfterViewChecked {
  @Input() todo: Todo | null = null;
  @Output() dismiss = new EventEmitter<void>();
  @Output() save = new EventEmitter<TodoEditPayload>();

  @ViewChild('titleInput', { static: false }) titleInputRef?: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  private shouldFocus = false;

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
          starred: this.todo.starred ?? false,
        });
        // Set flag to focus after view is checked
        this.shouldFocus = true;
      } else {
        this.form.reset({
          title: '',
          description: '',
          isCompleted: false,
          priority: 'MEDIUM',
          starred: false,
        });
        this.shouldFocus = false;
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldFocus && this.titleInputRef?.nativeElement) {
      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(() => {
        this.titleInputRef?.nativeElement?.focus();
        this.titleInputRef?.nativeElement?.select();
        this.shouldFocus = false;
      }, 0);
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
