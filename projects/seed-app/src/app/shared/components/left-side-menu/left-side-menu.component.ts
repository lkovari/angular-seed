import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { type MenuItem } from '../../models/menu/menu-item.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-left-side-menu',
  imports: [RouterLink],
  templateUrl: './left-side-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './left-side-menu.component.scss',
})
export class LeftSideMenuComponent {
  menuItems = input<MenuItem[]>([]);
  menuItemSelected = output();
}
