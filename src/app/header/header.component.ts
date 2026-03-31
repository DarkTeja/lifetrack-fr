import { Component, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  currentDate = new Date();
  status = 'Active';
  showHelpModal = false;
  
  constructor() {}

  toggleHelp() {
    this.showHelpModal = !this.showHelpModal;
  }
}
