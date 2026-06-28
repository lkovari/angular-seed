import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '../../../../../../seed-i18n-lib/src/public-api';

@Component({
  selector: 'app-feature-b',
  imports: [TranslatePipe],
  templateUrl: './feature-b.component.html',
  styleUrl: './feature-b.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureBComponent {}
