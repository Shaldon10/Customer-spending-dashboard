import { Route } from '@angular/router';

export const appRoutes: Route[] = [
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
];
