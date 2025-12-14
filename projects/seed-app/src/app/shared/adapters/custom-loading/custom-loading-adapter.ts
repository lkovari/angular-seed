import { type LoadingIndicatorAdapter } from '../../../../../../seed-common-lib/src/public-api';

/**
 * Custom loading adapter that uses external HTML and SCSS files
 * HTML: custom-loading.html
 * SCSS: custom-loading.scss
 */
export class CustomLoadingAdapter implements LoadingIndicatorAdapter {
  private containerElement: HTMLElement | null = null;

  show(): void {
    if (!this.containerElement) {
      // Create container
      this.containerElement = document.createElement('div');
      this.containerElement.id = 'custom-loading-container';

      // Set the HTML content from custom-loading.html
      this.containerElement.innerHTML = `
        <div class="custom-loading-overlay">
          <div class="custom-loading-spinner"></div>
          <div class="custom-loading-text">Loading...</div>
        </div>
      `;

      // Inject the styles from custom-loading.scss
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
    // Check if styles are already injected
    if (!document.getElementById('custom-loading-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'custom-loading-styles';

      // Styles from custom-loading.scss
      styleElement.textContent = `
        .custom-loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease-in-out;
        }

        .custom-loading-spinner {
          width: 60px;
          height: 60px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #f97316;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .custom-loading-text {
          color: white;
          margin-top: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;

      document.head.appendChild(styleElement);
    }
  }
}
