import { DatePipe } from '@angular/common';
import { Component, output, input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [DatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  lastUpdateDate = new Date('01/05/2026 07:01 PM');
  sidebarVisibleChange = output();

  // Inputs from parent
  showErrorIndicator = input<boolean>(false);
  errorCount = input<number>(0);
  errorIndicatorClick = output();

  toggleSidebar(): void {
    this.sidebarVisibleChange.emit();
  }

  handleErrorIndicatorClick(): void {
    this.errorIndicatorClick.emit();
  }
}
