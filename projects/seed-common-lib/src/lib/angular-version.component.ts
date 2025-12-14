import { Component, type OnInit } from '@angular/core';
import * as angular from '@angular/forms';

@Component({
  selector: 'lib-angular-version',
  imports: [],
  templateUrl: './angular-version.component.html',
  styleUrl: './angular-version.component.scss',
})
export class AngularVersionComponent implements OnInit {
  angularVersion!: string;
  ngOnInit(): void {
    this.angularVersion = angular.VERSION.full;
  }
}
