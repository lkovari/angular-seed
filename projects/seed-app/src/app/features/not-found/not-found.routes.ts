import { type Routes } from '@angular/router';

export const NOT_FOUND_ROUTES: Routes = [
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/not-found.component').then((m) => m.NotFoundComponent),
  },
];
