import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeedCommonLibComponent } from '../../../seed-common-lib/src/public-api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SeedCommonLibComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'seed-app';
}
