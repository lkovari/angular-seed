import {
  Component,
  signal,
  input,
  output,
  type OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { type MenuItem } from '../../models/menu/menu-item.interface';
import { LeftSideMenuComponent } from '../left-side-menu/left-side-menu.component';

import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    LeftSideMenuComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements OnDestroy {
  sidebarVisible = signal(true);
  private _isMobileView = signal(false);
  private resizeListener!: () => void;

  showErrorIndicator = input<boolean>(false);
  errorCount = input<number>(0);
  errorIndicatorClick = output();

  menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/',
    },
    {
      label: 'Feature A',
      icon: 'pi pi-map',
      routerLink: '/feature-a',
    },
    {
      label: 'Feature B',
      icon: 'pi pi-globe',
      routerLink: '/feature-b',
    },
  ];

  constructor() {
    this._isMobileView.set(window.innerWidth <= 768);
    if (this._isMobileView()) {
      this.sidebarVisible.set(false);
    } else {
      this.sidebarVisible.set(true);
    }

    this.resizeListener = () => {
      this._isMobileView.set(window.innerWidth <= 768);
      if (this._isMobileView()) {
        this.sidebarVisible.set(false);
      } else {
        this.sidebarVisible.set(true);
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  toggleSidebar(): void {
    this.sidebarVisible.update((value) => !value);
  }

  openNav(): void {
    this.sidebarVisible.set(true);
  }

  closeNav(): void {
    if (window.innerWidth <= 768) {
      this.sidebarVisible.set(false);
    }
  }

  isMobileView(): boolean {
    return this._isMobileView();
  }
}
