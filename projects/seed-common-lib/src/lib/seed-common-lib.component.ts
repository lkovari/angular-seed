import { Component, OnInit } from '@angular/core';
import * as angular from '@angular/forms';

@Component({
  selector: 'lib-seed-common-lib',
  templateUrl: './lib-seed-common-lib.component.html',
  styleUrl: './lib-seed-common-lib.component.scss',
  imports: [],
})
export class SeedCommonLibComponent implements OnInit {
  angularVersion!: string;

  ngOnInit(): void {
    this.angularVersion = angular.VERSION.full;
  }
}
