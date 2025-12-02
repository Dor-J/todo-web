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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Todo } from '../../../../todo';

export interface TodoEditPayload {
  title: string;
  description?: string;
  isCompleted: boolean;
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
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    isCompleted: [false],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todo']) {
      if (this.todo) {
        this.form.reset({
          title: this.todo.title,
          description: this.todo.description ?? '',
          isCompleted: this.todo.isCompleted,
        });
      } else {
        this.form.reset({
          title: '',
          description: '',
          isCompleted: false,
        });
      }
    }
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
