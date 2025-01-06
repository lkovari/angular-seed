import * as i0 from '@angular/core';
import { Injectable, Component } from '@angular/core';

class SeedCommonLibService {
    constructor() { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: SeedCommonLibService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: SeedCommonLibService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: SeedCommonLibService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class SeedCommonLibComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: SeedCommonLibComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.5", type: SeedCommonLibComponent, isStandalone: true, selector: "lib-seed-common-lib", ngImport: i0, template: `
    <p>
      seed-common-lib works!
    </p>
  `, isInline: true, styles: [""] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: SeedCommonLibComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-seed-common-lib', imports: [], template: `
    <p>
      seed-common-lib works!
    </p>
  ` }]
        }] });

/*
 * Public API Surface of seed-common-lib
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SeedCommonLibComponent, SeedCommonLibService };
//# sourceMappingURL=seed-common-lib.mjs.map
