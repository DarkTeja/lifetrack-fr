import { Component, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(@Inject(DOCUMENT) private document: Document, private renderer: Renderer2) {}
  
  toggleTheme() {
    const body = this.document.body;
    if (body.classList.contains('light')) {
      this.renderer.removeClass(body, 'light');
    } else {
      this.renderer.addClass(body, 'light');
    }
  }
}
