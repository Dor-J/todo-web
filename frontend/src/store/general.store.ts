import { Injectable, signal } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class UiStore {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);

  clearToast(): void {
    this.toast.set(null);
  }

  clearError(): void {
    this.error.set(null);
  }

  setLoading(loading: boolean): void {
    this.loading.set(loading);
  }

  setError(error: string | null): void {
    this.error.set(error);
  }

  setToast(toast: string | null): void {
    this.toast.set(toast);
  }
}