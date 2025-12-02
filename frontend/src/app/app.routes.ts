import { Routes } from '@angular/router';
import { AppShell } from './app/components/app-shell/app-shell';
import { TodoContainer } from './app/components/todo-container/todo-container';

export const routes: Routes = [
  {
    path: '',
    component: AppShell,
    children: [
      {
        path: '',
        component: TodoContainer,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
