import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingIndicatorService } from '../loading-indicator/loading-indicator.service';

@Component({
  selector: 'lib-wait-spinner-test',
  templateUrl: './wait-spinner-test.component.html',
  styleUrl: './wait-spinner-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaitSpinnerTestComponent {
  private http = inject(HttpClient);
  private loadingService = inject(LoadingIndicatorService);

  showModal = signal(false);
  httpCallDisabled = signal(false);
  manualSpinnerDisabled = signal(false);
  multipleCallsDisabled = signal(false);

  simulateHttpCall(): void {
    if (this.httpCallDisabled()) return;

    this.httpCallDisabled.set(true);
    console.log('🔄 Starting simulated HTTP call...');
    console.log('📊 Current ref count:', this.loadingService.getRefCount());

    this.http.get('https://httpbin.org/delay/4').subscribe({
      next: (response) => {
        console.log('✅ HTTP call completed successfully');
        console.log('📊 Final ref count:', this.loadingService.getRefCount());
        console.log('Response:', response);
        this.httpCallDisabled.set(false);
      },
      error: (error) => {
        console.error('❌ HTTP call failed:', error);
        console.log('📊 Final ref count:', this.loadingService.getRefCount());
        this.httpCallDisabled.set(false);
      },
    });
  }

  testManualSpinner(): void {
    if (this.manualSpinnerDisabled()) return;

    this.manualSpinnerDisabled.set(true);
    console.log('🔄 Manual spinner test...');
    this.loadingService.showWaitSpinner();
    console.log('📊 Ref count after show:', this.loadingService.getRefCount());

    setTimeout(() => {
      this.loadingService.hideWaitSpinner();
      console.log(
        '📊 Ref count after hide:',
        this.loadingService.getRefCount(),
      );
      this.manualSpinnerDisabled.set(false);
    }, 3000);
  }

  testMultipleCalls(): void {
    if (this.multipleCallsDisabled()) return;

    this.multipleCallsDisabled.set(true);
    console.log('🔄 Starting 3 concurrent HTTP calls...');

    let completedCalls = 0;
    const totalCalls = 3;

    const checkComplete = () => {
      completedCalls++;
      if (completedCalls === totalCalls) {
        this.multipleCallsDisabled.set(false);
      }
    };

    this.http.get('https://httpbin.org/delay/2').subscribe({
      next: () => checkComplete(),
      error: () => checkComplete(),
    });

    this.http.get('https://httpbin.org/delay/3').subscribe({
      next: () => checkComplete(),
      error: () => checkComplete(),
    });

    this.http.get('https://httpbin.org/delay/4').subscribe({
      next: () => checkComplete(),
      error: () => checkComplete(),
    });

    console.log('📊 Initial ref count:', this.loadingService.getRefCount());
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }
}
