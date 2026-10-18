import { Router } from 'express';

const categories = [
  { name: 'Groceries', amount: 1250.3, percentage: 29.4, transactionCount: 15, color: '#FF6B6B', icon: 'shopping-cart' },
  { name: 'Entertainment', amount: 890.2, percentage: 20.9, transactionCount: 8, color: '#4ECDC4', icon: 'film' },
  { name: 'Transportation', amount: 680.45, percentage: 16, transactionCount: 12, color: '#45B7D1', icon: 'car' },
  { name: 'Dining', amount: 520.3, percentage: 12.2, transactionCount: 9, color: '#F7DC6F', icon: 'utensils' },
  { name: 'Shopping', amount: 450.8, percentage: 10.6, transactionCount: 6, color: '#BB8FCE', icon: 'shopping-bag' },
  { name: 'Utilities', amount: 458.7, percentage: 10.8, transactionCount: 3, color: '#85C1E9', icon: 'zap' },
];

const trends = [
  { month: '2024-01', totalSpent: 3890.25, transactionCount: 42, averageTransaction: 92.62 },
  { month: '2024-02', totalSpent: 4150.8, transactionCount: 38, averageTransaction: 109.23 },
  { month: '2024-03', totalSpent: 3750.6, transactionCount: 45, averageTransaction: 83.35 },
  { month: '2024-04', totalSpent: 4200.45, transactionCount: 39, averageTransaction: 107.7 },
  { month: '2024-05', totalSpent: 3980.3, transactionCount: 44, averageTransaction: 90.46 },
  { month: '2024-06', totalSpent: 4250.75, transactionCount: 47, averageTransaction: 90.44 },
];

const transactions = [
  {
    id: 'txn_123456',
    date: '2024-09-16T14:30:00Z',
    merchant: 'Pick n Pay',
    category: 'Groceries',
    amount: 245.8,
    description: 'Weekly groceries',
    paymentMethod: 'Credit Card',
    icon: 'shopping-cart',
    categoryColor: '#FF6B6B',
  },
  {
    id: 'txn_123457',
    date: '2024-09-15T10:15:00Z',
    merchant: 'Netflix',
    category: 'Entertainment',
    amount: 199,
    description: 'Monthly subscription',
    paymentMethod: 'Debit Order',
    icon: 'film',
    categoryColor: '#4ECDC4',
  },
];

const goals = [
  { id: 'goal_001', category: 'Entertainment', monthlyBudget: 1000, currentSpent: 650.3, percentageUsed: 65.03, daysRemaining: 12, status: 'on_track' },
  { id: 'goal_002', category: 'Groceries', monthlyBudget: 1500, currentSpent: 1450.8, percentageUsed: 96.72, daysRemaining: 12, status: 'warning' },
];

const dateRangePresets = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last year', value: '1y' },
];

function queryString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function queryNumber(value: unknown, fallback: number): number {
  const parsed = Number(queryString(value));
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

export const mockApiRouter = Router();

mockApiRouter.get('/customers/:customerId/profile', (req, res) => {
  res.json({
    customerId: req.params['customerId'],
    name: 'John Doe',
    email: 'john.doe@email.com',
    joinDate: '2023-01-15',
    accountType: 'premium',
    totalSpent: 15420.5,
    currency: 'ZAR',
  });
});

mockApiRouter.get('/customers/:customerId/spending/summary', (req, res) => {
  res.json({
    period: queryString(req.query['period']) ?? '30d',
    totalSpent: 4250.75,
    transactionCount: 47,
    averageTransaction: 90.44,
    topCategory: 'Groceries',
    comparedToPrevious: { spentChange: 12.5, transactionChange: -3.2 },
  });
});

mockApiRouter.get('/customers/:customerId/spending/categories', (req, res) => {
  res.json({
    dateRange: {
      startDate: queryString(req.query['startDate']) ?? '2024-08-16',
      endDate: queryString(req.query['endDate']) ?? '2024-09-16',
    },
    totalAmount: 4250.75,
    categories,
  });
});

mockApiRouter.get('/customers/:customerId/spending/trends', (req, res) => {
  const months = Math.min(24, Math.max(1, queryNumber(req.query['months'], 12)));
  res.json({ trends: trends.slice(-months) });
});

mockApiRouter.get('/customers/:customerId/transactions', (req, res) => {
  const category = queryString(req.query['category']);
  const startDate = queryString(req.query['startDate']);
  const endDate = queryString(req.query['endDate']);
  const sortBy = queryString(req.query['sortBy']) ?? 'date_desc';
  const limit = Math.min(100, Math.max(1, queryNumber(req.query['limit'], 20)));
  const offset = Math.max(0, queryNumber(req.query['offset'], 0));

  const filtered = transactions
    .filter((transaction) => !category || transaction.category === category)
    .filter((transaction) => !startDate || transaction.date.slice(0, 10) >= startDate)
    .filter((transaction) => !endDate || transaction.date.slice(0, 10) <= endDate)
    .sort((left, right) => {
      switch (sortBy) {
        case 'date_asc':
          return left.date.localeCompare(right.date);
        case 'amount_desc':
          return right.amount - left.amount;
        case 'amount_asc':
          return left.amount - right.amount;
        default:
          return right.date.localeCompare(left.date);
      }
    });

  const page = filtered.slice(offset, offset + limit);
  res.json({
    transactions: page,
    pagination: {
      total: filtered.length,
      limit,
      offset,
      hasMore: offset + page.length < filtered.length,
    },
  });
});

mockApiRouter.get('/customers/:customerId/goals', (_req, res) => {
  res.json({ goals });
});

mockApiRouter.get('/customers/:customerId/filters', (_req, res) => {
  res.json({
    categories: categories.map(({ name, color, icon }) => ({ name, color, icon })),
    dateRangePresets,
  });
});
