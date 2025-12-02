import { Component } from '@angular/core';

@Component({
  selector: 'app-footer-bar',
  standalone: true,
  imports: [],
  templateUrl: './footer-bar.html',
})
export class FooterBar {
  readonly year = new Date().getFullYear();
}
