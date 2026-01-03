import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  type OnDestroy,
  DestroyRef,
} from '@angular/core';
import { LoadingIndicatorService } from '../loading-indicator/loading-indicator.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lib-wait-spinner-test',
  templateUrl: './wait-spinner-test.component.html',
  styleUrl: './wait-spinner-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaitSpinnerTestComponent implements OnDestroy {
  private loadingService = inject(LoadingIndicatorService);
  private destroyRef = inject(DestroyRef);

  showModal = signal(false);
  httpCallDisabled = signal(false);
  manualSpinnerDisabled = signal(false);
  multipleCallsDisabled = signal(false);
  private manualSpinnerTimeout: ReturnType<typeof setTimeout> | undefined;

  simulateHttpCall(): void {
    if (this.httpCallDisabled()) return;

    this.httpCallDisabled.set(true);
    console.warn('Starting simulated HTTP call...');
    console.warn('Current ref count:', this.loadingService.getRefCount());

    this.loadingService.showWaitSpinner();
    of({ success: true, message: 'Mock HTTP call completed' })
      .pipe(
        delay(4000),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.loadingService.hideWaitSpinner();
          console.warn('HTTP call completed successfully');
          console.warn('Final ref count:', this.loadingService.getRefCount());
          console.warn('Response:', response);
          this.httpCallDisabled.set(false);
        },
        error: (error) => {
          this.loadingService.hideWaitSpinner();
          console.error('HTTP call failed:', error);
          console.warn('Final ref count:', this.loadingService.getRefCount());
          this.httpCallDisabled.set(false);
        },
      });
  }

  testManualSpinner(): void {
    if (this.manualSpinnerDisabled()) return;

    this.manualSpinnerDisabled.set(true);
    console.warn('Manual spinner test...');
    this.loadingService.showWaitSpinner();
    console.warn('Ref count after show:', this.loadingService.getRefCount());

    if (this.manualSpinnerTimeout) {
      clearTimeout(this.manualSpinnerTimeout);
    }

    this.manualSpinnerTimeout = setTimeout(() => {
      this.loadingService.hideWaitSpinner();
      console.warn(
        'Ref count after hide:',
        this.loadingService.getRefCount(),
      );
      this.manualSpinnerDisabled.set(false);
      this.manualSpinnerTimeout = undefined;
    }, 3000);
  }

  testMultipleCalls(): void {
    if (this.multipleCallsDisabled()) return;

    this.multipleCallsDisabled.set(true);
    console.warn('Starting 3 concurrent HTTP calls...');

    let completedCalls = 0;
    const totalCalls = 3;

    const checkComplete = () => {
      completedCalls++;
      if (completedCalls === totalCalls) {
        this.multipleCallsDisabled.set(false);
      }
    };

    this.loadingService.showWaitSpinner();
    this.loadingService.showWaitSpinner();
    this.loadingService.showWaitSpinner();

    of({ call: 1, delay: 2000 })
      .pipe(
        delay(2000),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.loadingService.hideWaitSpinner();
          checkComplete();
        },
        error: () => {
          this.loadingService.hideWaitSpinner();
          checkComplete();
        },
      });

    of({ call: 2, delay: 3000 })
      .pipe(
        delay(3000),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.loadingService.hideWaitSpinner();
          checkComplete();
        },
        error: () => {
          this.loadingService.hideWaitSpinner();
          checkComplete();
        },
      });

    of({ call: 3, delay: 4000 })
      .pipe(
        delay(4000),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.loadingService.hideWaitSpinner();
          checkComplete();
        },
        error: () => {
          this.loadingService.hideWaitSpinner();
          checkComplete();
        },
      });

    console.warn('Initial ref count:', this.loadingService.getRefCount());
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  ngOnDestroy(): void {
    if (this.manualSpinnerTimeout) {
      clearTimeout(this.manualSpinnerTimeout);
    }
  }
}
