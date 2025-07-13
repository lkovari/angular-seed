import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
    },
    // splash screen
    // login
    // logout
    {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        //canActivate: [authGuard]
    },
    {
        path: 'not-found',
        loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
    },
    {
        path: '**', redirectTo: 'not-found'
    }
];
