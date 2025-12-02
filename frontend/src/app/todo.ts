import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from 'ngx-dotenv';
import type { Todo } from './models/todo';
export type { Todo } from './models/todo';

export interface CreateTodoDto {
  title: string;
  description?: string;
  isCompleted?: boolean;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  completedAt?: string | null;
  updatedAt?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient, private dotenv: ConfigService) {
    const baseUrl = String(this.dotenv.get('API_URL') ?? '').replace(/\/+$/, '');
    const endpoint = String(this.dotenv.get('TODO_ENDPOINT') ?? '/todos').replace(/^\/?/, '/');
    this.apiUrl = `${baseUrl}${endpoint}`;
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
