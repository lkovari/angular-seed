import { type Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
    //canActivate: [authGuard]
  },
  {
    path: 'components-tests',
    loadComponent: () =>
      import('../../../seed-common-lib/src/public-api').then(
        (m) => m.ComponentsTestsComponent,
      ),
  },
  // splash screen
  // login
  // logout
  {
    path: 'not-found',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
