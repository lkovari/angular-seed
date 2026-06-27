import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { type NavigationItem } from '../../navigation/navigation.types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-left-side-menu',
  imports: [RouterLink],
  templateUrl: './left-side-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './left-side-menu.component.scss',
})
export class LeftSideMenuComponent {
  menuItems = input<NavigationItem[]>([]);
  menuItemSelected = output();
}
