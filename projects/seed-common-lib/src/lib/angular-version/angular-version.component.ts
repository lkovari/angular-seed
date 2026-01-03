import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import * as angular from '@angular/forms';

@Component({
  selector: 'lib-angular-version',
  imports: [],
  templateUrl: './angular-version.component.html',
  styleUrl: './angular-version.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularVersionComponent {
  angularVersion = signal(angular.VERSION.full);
}
