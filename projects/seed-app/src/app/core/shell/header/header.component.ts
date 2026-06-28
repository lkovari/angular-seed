import { DatePipe } from '@angular/common';
import {
  Component,
  output,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslatePipe } from '../../../../../../seed-i18n-lib/src/public-api';

@Component({
  selector: 'app-header',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  lastUpdateDate = new Date('2026-06-28T15:25:00');
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
