import { Component, type OnInit, type OnDestroy } from '@angular/core';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
    console.warn('NotFoundComponent initialized');
  }

  ngOnDestroy(): void {
    console.warn('NotFoundComponent destroyed');
  }
}
