import { Component, EventEmitter, Output, inject, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { getValidationErrorMessage, noWhitespaceValidator } from '../validators';
import { TodoFormService } from '../../../../services/todo-form.service';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-form.html',
})
export class TodoForm implements OnInit, OnDestroy {
  @Output() save = new EventEmitter<{ title: string; description?: string; isCompleted?: boolean }>();
  @ViewChild('titleInput', { static: false }) titleInputRef?: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  private readonly todoFormService = inject(TodoFormService);
  private focusSubscription?: Subscription;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120), noWhitespaceValidator()]],
    description: ['', [Validators.maxLength(1000)]],
    isCompleted: [false],
  });

  ngOnInit(): void {
    this.focusSubscription = this.todoFormService.focusRequest.subscribe(() => {
      this.focusInput();
    });
  }

  ngOnDestroy(): void {
    this.focusSubscription?.unsubscribe();
  }

  /**
   * Gets the validation error message for a form control
   */
  getErrorMessage(control: AbstractControl | null, fieldName: string): string | null {
    return getValidationErrorMessage(control, fieldName);
  }

  /**
   * Focuses the title input field.
   */
  focusInput(): void {
    if (this.titleInputRef?.nativeElement) {
      setTimeout(() => {
        this.titleInputRef?.nativeElement?.focus();
      }, 0);
    }
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
