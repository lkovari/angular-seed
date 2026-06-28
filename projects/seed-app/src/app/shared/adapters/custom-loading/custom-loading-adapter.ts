import { type LoadingIndicatorAdapter } from '../../../../../../seed-common-lib/src/public-api';

export class CustomLoadingAdapter implements LoadingIndicatorAdapter {
  private containerElement: HTMLElement | null = null;

  show(): void {
    if (!this.containerElement) {
      this.containerElement = document.createElement('div');
      this.containerElement.id = 'custom-loading-container';

      this.containerElement.innerHTML = `
        <div class="custom-loading-overlay">
          <div class="custom-loading-spinner"></div>
          <div class="custom-loading-text">Loading...</div>
        </div>
      `;

      this.injectStyles();

      document.body.appendChild(this.containerElement);
    }
  }

  hide(): void {
    if (this.containerElement) {
      this.containerElement.remove();
      this.containerElement = null;
    }
  }

  private injectStyles(): void {
    if (!document.getElementById('custom-loading-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'custom-loading-styles';

      styleElement.textContent = `
        .custom-loading-overlay {
          position: fixed;
          inset: 0;
          background: color-mix(in srgb, #000000 70%, transparent);
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: custom-loading-fade-in 0.3s ease-in-out;
        }

        .custom-loading-spinner {
          width: 60px;
          height: 60px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #f97316;
          border-radius: 50%;
          animation: custom-loading-spin 0.8s linear infinite;
        }

        .custom-loading-text {
          color: white;
          margin-top: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        @keyframes custom-loading-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes custom-loading-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;

      document.head.appendChild(styleElement);
    }
  }
}
