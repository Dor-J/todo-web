import { Component } from '@angular/core';
import { HeaderBar } from '../header-bar/header-bar';
import { FooterBar } from '../footer-bar/footer-bar';
import { TodoContainer } from '../todo-container/todo-container';
import { Toast } from '../toast/toast';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [HeaderBar, FooterBar, TodoContainer, Toast, ConfirmDialog],
  templateUrl: './app-shell.html',
})
export class AppShell {

}
