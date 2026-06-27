import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-feature-b',
  imports: [],
  templateUrl: './feature-b.component.html',
  styleUrl: './feature-b.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureBComponent {
  readonly title = 'Feature B';
}
