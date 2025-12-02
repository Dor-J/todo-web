import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service for coordinating focus requests to the todo form component.
 * Allows components to request focus on the todo form input field.
 */
@Injectable({
  providedIn: 'root',
})
export class TodoFormService {
  private readonly focusRequest$ = new Subject<void>();

  /**
   * Observable that emits when focus is requested on the todo form input.
   */
  readonly focusRequest = this.focusRequest$.asObservable();

  /**
   * Requests focus on the todo form input field.
   */
  requestFocus(): void {
    this.focusRequest$.next();
  }
}

