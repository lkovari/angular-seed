/**
 * Example file demonstrating the detect-deprecated rule
 * This file is for testing purposes only
 */

/**
 * @deprecated Use NewService instead
 */
export class OldService {
  /**
   * @deprecated This method is deprecated
   */
  oldMethod(): void {
    console.log('old');
  }
}

/**
 * @deprecated Use newFunction instead
 */
export function oldFunction(): string {
  return 'old';
}

/**
 * @deprecated This interface is deprecated: use NewInterface
 */
export interface OldInterface {
  value: string;
}

/**
 * @deprecated Use NewType instead
 */
export type OldType = string;

export class ExampleUsage {
  private oldService = new OldService();

  example() {
    // These usages should trigger warnings if reportUsage is enabled
    oldFunction();
    this.oldService.oldMethod();
  }
}

