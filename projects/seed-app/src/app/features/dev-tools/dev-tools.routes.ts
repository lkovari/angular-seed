import { type Routes } from '@angular/router';

export const DEV_TOOLS_ROUTES: Routes = [
  {
    path: 'components-tests',
    loadComponent: () =>
      import('./components/components-tests/components-tests.component').then(
        (m) => m.ComponentsTestsComponent,
      ),
  },
];
