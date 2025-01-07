import { Component, input } from '@angular/core';
import { MenuItem } from '../../models/menu/menu-item.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-left-side-menu',
  imports: [RouterLink],
  templateUrl: './left-side-menu.component.html',
  styleUrl: './left-side-menu.component.scss',
})
export class LeftSideMenuComponent {
  menuItems = input<MenuItem[]>([]);
}
