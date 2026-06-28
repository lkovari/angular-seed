import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { type NavigationItem } from '../../navigation/navigation.types';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../../../seed-i18n-lib/src/public-api';

@Component({
  selector: 'app-left-side-menu',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './left-side-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './left-side-menu.component.scss',
})
export class LeftSideMenuComponent {
  menuItems = input<NavigationItem[]>([]);
  menuItemSelected = output();
}
