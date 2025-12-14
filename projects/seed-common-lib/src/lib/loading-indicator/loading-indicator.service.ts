import { Injectable, signal, computed } from '@angular/core';

export interface LoadingIndicatorAdapter {
  show(): void;
  hide(): void;
}

@Injectable({
  providedIn: 'root',
})
export class LoadingIndicatorService {
  private refCount = signal(0);
  private adapter: LoadingIndicatorAdapter | null = null;

  public readonly isLoading = computed(() => this.refCount() > 0);

  setAdapter(adapter: LoadingIndicatorAdapter): void {
    this.adapter = adapter;
  }

  showWaitSpinner(): void {
    const currentCount = this.refCount();
    const newCount = currentCount + 1;
    this.refCount.set(newCount);
    console.warn(`>>>RefCount #${newCount}`);

    if (currentCount === 0) {
      this.displaySpinner();
    }
  }

  hideWaitSpinner(): void {
    const currentCount = this.refCount();
    if (currentCount > 0) {
      const newCount = currentCount - 1;
      this.refCount.set(newCount);
      console.warn(`>>>RefCount #${newCount}`);

      if (currentCount === 1) {
        this.hideSpinnerDisplay();
      }
    }
  }

  forceHide(): void {
    this.refCount.set(0);
    console.warn('>>>RefCount #0 (forced)');
    this.hideSpinnerDisplay();
  }

  getRefCount(): number {
    return this.refCount();
  }

  private displaySpinner(): void {
    if (this.adapter) {
      this.adapter.show();
    } else {
      this.showDefaultSpinner();
    }
  }

  private hideSpinnerDisplay(): void {
    if (this.adapter) {
      this.adapter.hide();
    } else {
      this.hideDefaultSpinner();
    }
  }

  private showDefaultSpinner(): void {
    if (!document.getElementById('default-loading-spinner')) {
      const spinner = document.createElement('div');
      spinner.id = 'default-loading-spinner';
      spinner.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        ">
          <div style="
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      document.body.appendChild(spinner);
    }
  }

  private hideDefaultSpinner(): void {
    const spinner = document.getElementById('default-loading-spinner');
    if (spinner) {
      spinner.remove();
    }
  }
}
