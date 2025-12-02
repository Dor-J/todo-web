import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from 'ngx-dotenv';
import type { Todo } from './models/todo';
export type { Todo } from './models/todo';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient, private dotenv: ConfigService) {
    this.apiUrl = this.dotenv.get('API_URL') ?? '';
  }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  addTodo(todo: Omit<Todo, 'id'>): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo);
  }

  updateTodo(todo: Todo): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${todo.id}`, todo);
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
