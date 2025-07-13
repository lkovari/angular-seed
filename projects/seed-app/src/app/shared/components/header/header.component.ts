import { DatePipe } from '@angular/common';
import {
  Component,
  output,
} from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [DatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  lastUpdateDate = new Date('07/13/2025 10:20 AM');
  onSidebarVisibleChange = output<void>();

  toggleSidebar(): void {
    this.onSidebarVisibleChange.emit();
  }
}
