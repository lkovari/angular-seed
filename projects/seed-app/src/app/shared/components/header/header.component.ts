import { DatePipe } from '@angular/common';
import {
  Component,
  output,
  inject,
  input,
} from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [DatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  lastUpdateDate = new Date('11/16/2025 10:58 PM');
  onSidebarVisibleChange = output<void>();
  
  // Inputs from parent
  showErrorIndicator = input<boolean>(false);
  errorCount = input<number>(0);
  onErrorIndicatorClick = output<void>();

  toggleSidebar(): void {
    this.onSidebarVisibleChange.emit();
  }

  handleErrorIndicatorClick(): void {
    this.onErrorIndicatorClick.emit();
  }
}
