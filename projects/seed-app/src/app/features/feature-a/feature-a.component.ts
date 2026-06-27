import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-feature-a',
  imports: [],
  templateUrl: './feature-a.component.html',
  styleUrl: './feature-a.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureAComponent {
  readonly title = 'Feature A';
}
