import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '../../../../../../seed-i18n-lib/src/public-api';

@Component({
  selector: 'app-feature-a',
  imports: [TranslatePipe],
  templateUrl: './feature-a.component.html',
  styleUrl: './feature-a.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureAComponent {}
