import { Component } from '@angular/core';
import { HeaderBar } from '../header-bar/header-bar';
import { FooterBar } from '../footer-bar/footer-bar';
import { Toast } from '../toast/toast';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { RouterOutlet } from '@angular/router';
import { TodoStore } from '../../../todo.store';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [HeaderBar, FooterBar, Toast, ConfirmDialog, RouterOutlet],
  templateUrl: './app-shell.html',
})
export class AppShell {
  constructor(readonly todoStore: TodoStore) {}
}
