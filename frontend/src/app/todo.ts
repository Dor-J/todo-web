import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Todo } from './models/todo';
export type { Todo } from './models/todo';

export interface CreateTodoDto {
  title: string;
  description?: string;
  isCompleted?: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  starred?: boolean;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  completedAt?: string | null;
  updatedAt?: string | null;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  starred?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    // Values injected at build time by @ngx-env/builder
    const baseUrl = import.meta.env.NG_APP_API_URL ?? 'http://localhost:5013';
    const endpoint = import.meta.env.NG_APP_TODO_ENDPOINT ?? '/todos';

    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const normalizedEndpoint = endpoint.replace(/^\/?/, '/');

    this.apiUrl = `${normalizedBase}${normalizedEndpoint}`;
  }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  addTodo(todo: CreateTodoDto): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo);
  }

  updateTodo(id: string, payload: UpdateTodoDto): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, payload);
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
