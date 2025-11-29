import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AngularVersionComponent } from '../../../../../../seed-common-lib/src/public-api';

@Component({
  selector: 'app-footer',
  imports: [AngularVersionComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  developers = [
    'László Kővári',
    'Developer #1',
    'Developer #2',
    'Developer #3',
  ];

  developerOrders = [
    [1, 2, 3, 4],
    [2, 3, 4, 1],
    [3, 4, 1, 2],
    [4, 1, 2, 3],
  ];

  private previousIndex: number | null = null;
  currentDeveloperOrder = '';
  private intervalId: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.currentDeveloperOrder = this.getDeveloperOrder();
    this.intervalId = setInterval(() => {
      this.currentDeveloperOrder = this.getDeveloperOrder();
      this.cdr.detectChanges();
    }, 9000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getDeveloperOrder(): string {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * 4);
    } while (idx === this.previousIndex);
    this.previousIndex = idx;
    const order = this.developerOrders[idx];
    return order.map((i) => this.developers[i - 1]).join(', ');
  }

  onAnimationEnd(): void {
    // TODO
  }
}
