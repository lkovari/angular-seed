import { type Routes } from '@angular/router';
import { HOME_ROUTES } from './features/home/home.routes';
import { FEATURE_A_ROUTES } from './features/feature-a/feature-a.routes';
import { FEATURE_B_ROUTES } from './features/feature-b/feature-b.routes';
import { DEV_TOOLS_ROUTES } from './features/dev-tools/dev-tools.routes';
import { NOT_FOUND_ROUTES } from './features/not-found/not-found.routes';

export const routes: Routes = [
  ...HOME_ROUTES,
  ...FEATURE_A_ROUTES,
  ...FEATURE_B_ROUTES,
  ...DEV_TOOLS_ROUTES,
  ...NOT_FOUND_ROUTES,
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
