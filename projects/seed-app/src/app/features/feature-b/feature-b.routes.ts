import { type Routes } from '@angular/router';

export const FEATURE_B_ROUTES: Routes = [
  {
    path: 'feature-b',
    loadComponent: () =>
      import('./pages/feature-b.component').then((m) => m.FeatureBComponent),
  },
];
