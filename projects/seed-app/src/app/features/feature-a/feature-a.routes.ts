import { type Routes } from '@angular/router';

export const FEATURE_A_ROUTES: Routes = [
  {
    path: 'feature-a',
    loadComponent: () =>
      import('./pages/feature-a.component').then((m) => m.FeatureAComponent),
  },
];
