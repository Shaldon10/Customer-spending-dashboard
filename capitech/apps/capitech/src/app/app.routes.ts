import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@capitech/customer-dashboard').then((m) => m.CustomerDashboard),
  },
];
