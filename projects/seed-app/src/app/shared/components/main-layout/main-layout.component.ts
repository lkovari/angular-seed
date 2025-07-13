import { Component, signal } from '@angular/core';
import { MenuItem } from '../../models/menu/menu-item.interface';
import { LeftSideMenuComponent } from '../left-side-menu/left-side-menu.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    LeftSideMenuComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  sidebarVisible: boolean = true;
  private _isMobileView = signal(false);
  private resizeListener!: () => void;

  menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/home',
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

  ngOnInit(): void {
    this._isMobileView.set(window.innerWidth <= 768);
    if (this._isMobileView()) {
      this.sidebarVisible = false;
    } else {
      this.sidebarVisible = true;
    }

    this.resizeListener = () => {
      this._isMobileView.set(window.innerWidth <= 768);
      if (this._isMobileView()) {
        this.sidebarVisible = false;
      } else {
        this.sidebarVisible = true;
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  openNav() {
    const navi = document.getElementById("navi");
    if (navi) {
      navi.style.width = "100%";
    }
  }

  closeNav() {
    if (window.innerWidth <= 768) {
      this.sidebarVisible = false;
    }
  }

  isMobileView(): boolean {
    return this._isMobileView();
  }
}
