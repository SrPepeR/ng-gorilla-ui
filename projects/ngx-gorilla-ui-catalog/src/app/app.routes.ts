import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Getting started · ngx-gorilla-ui',
    loadComponent: () =>
      import('./pages/getting-started/getting-started').then((m) => m.GettingStarted),
  },
  {
    path: 'theming',
    title: 'Theming · ngx-gorilla-ui',
    loadComponent: () => import('./pages/theming/theming').then((m) => m.Theming),
  },
  {
    path: 'tokens',
    title: 'Tokens · ngx-gorilla-ui',
    loadComponent: () => import('./pages/tokens/tokens').then((m) => m.Tokens),
  },
  { path: '**', redirectTo: '' },
];
