import { Route } from '@angular/router';
import { demoAuthGuard } from '@capitech/login';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('@capitech/login').then((m) => m.Login),
    title: 'Capitech Insights',
  },
  {
    path: '',
    canActivateChild: [demoAuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@capitech/customer-dashboard').then((m) => m.CustomerDashboard),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('@capitech/transactions').then((m) => m.Transactions),
      },
      {
        path: 'spending-analysis',
        loadComponent: () =>
          import('@capitech/spending-analysis').then((m) => m.SpendingAnalysis),
      },
      {
        path: 'budget-goals',
        loadComponent: () =>
          import('@capitech/budget-goals').then((m) => m.BudgetGoals),
      },
      {
        path: 'customer-profile',
        loadComponent: () =>
          import('@capitech/customer-profile').then((m) => m.CustomerProfile),
      },
    ],
  },
];
