import { Component, OnInit } from '@angular/core';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { SeedCommonLibComponent } from '../../../seed-common-lib/src/lib/seed-common-lib.component';
@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'seed-app';
}
