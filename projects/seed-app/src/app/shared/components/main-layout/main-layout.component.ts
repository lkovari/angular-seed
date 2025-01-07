import { Component } from '@angular/core';
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
  menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/features/home',
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

  toggleSidebar(value: boolean): void {
    this.sidebarVisible = value;
  }
}
