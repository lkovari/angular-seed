import { Component } from '@angular/core';
import { AngularVersionComponent } from '../../../../../../seed-common-lib/src/lib/angular-version.component';

@Component({
  selector: 'app-footer',
  imports: [AngularVersionComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {}
