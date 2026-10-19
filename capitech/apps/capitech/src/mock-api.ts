import { Router } from 'express';

const categoryMetadata = [
  { name: 'Groceries', color: '#FF6B6B', icon: 'shopping-cart' },
  { name: 'Entertainment', color: '#4ECDC4', icon: 'film' },
  { name: 'Transportation', color: '#45B7D1', icon: 'car' },
  { name: 'Dining', color: '#F7DC6F', icon: 'utensils' },
  { name: 'Shopping', color: '#BB8FCE', icon: 'shopping-bag' },
  { name: 'Utilities', color: '#85C1E9', icon: 'zap' },
];

const transactions = [
  { merchant: 'Pick n Pay', category: 'Groceries', amount: 245.8, description: 'Weekly groceries', paymentMethod: 'Credit Card', daysAgo: 1 },
  { merchant: 'Netflix', category: 'Entertainment', amount: 199, description: 'Monthly subscription', paymentMethod: 'Debit Order', daysAgo: 2 },
  { merchant: 'Shell', category: 'Transportation', amount: 620.5, description: 'Fuel', paymentMethod: 'Credit Card', daysAgo: 3 },
  { merchant: 'The Daily Grind', category: 'Dining', amount: 86, description: 'Coffee and breakfast', paymentMethod: 'Debit Card', daysAgo: 4 },
  { merchant: 'Woolworths', category: 'Groceries', amount: 438.25, description: 'Household shopping', paymentMethod: 'Debit Card', daysAgo: 6 },
  { merchant: 'Uber', category: 'Transportation', amount: 154.7, description: 'Ride home', paymentMethod: 'Credit Card', daysAgo: 8 },
  { merchant: 'Checkers', category: 'Groceries', amount: 312.4, description: 'Fresh produce', paymentMethod: 'Debit Card', daysAgo: 10 },
  { merchant: 'Spotify', category: 'Entertainment', amount: 89.99, description: 'Music subscription', paymentMethod: 'Debit Order', daysAgo: 12 },
  { merchant: 'Mugg & Bean', category: 'Dining', amount: 248.5, description: 'Lunch with friends', paymentMethod: 'Credit Card', daysAgo: 15 },
  { merchant: 'Takealot', category: 'Shopping', amount: 799, description: 'Home accessories', paymentMethod: 'Credit Card', daysAgo: 18 },
  { merchant: 'City Power', category: 'Utilities', amount: 950, description: 'Electricity', paymentMethod: 'Debit Order', daysAgo: 22 },
  { merchant: 'Pick n Pay', category: 'Groceries', amount: 527.35, description: 'Weekly groceries', paymentMethod: 'Debit Card', daysAgo: 28 },
  { merchant: 'Ster-Kinekor', category: 'Entertainment', amount: 310, description: 'Movie tickets', paymentMethod: 'Credit Card', daysAgo: 31 },
  { merchant: 'Engen', category: 'Transportation', amount: 710.2, description: 'Fuel', paymentMethod: 'Credit Card', daysAgo: 36 },
  { merchant: 'Woolworths', category: 'Groceries', amount: 386.75, description: 'Groceries', paymentMethod: 'Debit Card', daysAgo: 45 },
  { merchant: 'Nando’s', category: 'Dining', amount: 194.9, description: 'Dinner', paymentMethod: 'Credit Card', daysAgo: 52 },
  { merchant: 'H&M', category: 'Shopping', amount: 1149, description: 'Clothing', paymentMethod: 'Credit Card', daysAgo: 60 },
  { merchant: 'Vodacom', category: 'Utilities', amount: 599, description: 'Mobile and data', paymentMethod: 'Debit Order', daysAgo: 75 },
  { merchant: 'Checkers', category: 'Groceries', amount: 472.6, description: 'Weekly groceries', paymentMethod: 'Debit Card', daysAgo: 88 },
  { merchant: 'Uber', category: 'Transportation', amount: 183.4, description: 'Ride to work', paymentMethod: 'Credit Card', daysAgo: 95 },
  { merchant: 'Netflix', category: 'Entertainment', amount: 199, description: 'Monthly subscription', paymentMethod: 'Debit Order', daysAgo: 110 },
  { merchant: 'Wimpy', category: 'Dining', amount: 135.5, description: 'Breakfast', paymentMethod: 'Debit Card', daysAgo: 130 },
  { merchant: 'Makro', category: 'Shopping', amount: 1380.75, description: 'Small appliances', paymentMethod: 'Credit Card', daysAgo: 160 },
  { merchant: 'Eskom', category: 'Utilities', amount: 824.3, description: 'Electricity', paymentMethod: 'Debit Order', daysAgo: 185 },
  { merchant: 'Pick n Pay', category: 'Groceries', amount: 603.8, description: 'Monthly groceries', paymentMethod: 'Debit Card', daysAgo: 220 },
  { merchant: 'Shell', category: 'Transportation', amount: 680.9, description: 'Fuel', paymentMethod: 'Credit Card', daysAgo: 260 },
  { merchant: 'Spotify', category: 'Entertainment', amount: 89.99, description: 'Music subscription', paymentMethod: 'Debit Order', daysAgo: 300 },
  { merchant: 'Woolworths', category: 'Groceries', amount: 425.15, description: 'Weekly groceries', paymentMethod: 'Debit Card', daysAgo: 340 },
  { merchant: 'The Daily Grind', category: 'Dining', amount: 112.5, description: 'Coffee and lunch', paymentMethod: 'Debit Card', daysAgo: 360 },
].map((transaction, index) => {
  const metadata = categoryMetadata.find(({ name }) => name === transaction.category);
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - transaction.daysAgo);
  return {
    ...transaction,
    id: `txn_${String(index + 1).padStart(6, '0')}`,
    date: date.toISOString(),
    icon: metadata?.icon ?? '',
    categoryColor: metadata?.color ?? '',
  };
});

function utcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isDateOnly(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && utcDateString(date) === value;
}

function periodLength(period: string | undefined): number {
  switch (period) {
    case '7d':
      return 7;
    case '90d':
      return 90;
    case '1y':
      return 365;
    default:
      return 30;
  }
}

function dateRange(period: string | undefined): { startDate: string; endDate: string } {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - periodLength(period) + 1);
  return { startDate: utcDateString(start), endDate: utcDateString(end) };
}

function shiftDate(date: string, days: number): string {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return utcDateString(shifted);
}

function normalizePeriod(value: string | undefined): '7d' | '30d' | '90d' | '1y' {
  return value === '7d' || value === '90d' || value === '1y' ? value : '30d';
}

function getTransactionsInRange(startDate: string, endDate: string) {
  return transactions.filter((transaction) => {
    const transactionDate = transaction.date.slice(0, 10);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

function summarizeMonthlyTrends(startDate: string, endDate: string) {
  const monthlyTotals = new Map<string, { totalSpent: number; transactionCount: number }>();
  const month = new Date(`${startDate.slice(0, 7)}-01T00:00:00Z`);
  const lastMonth = endDate.slice(0, 7);

  while (utcDateString(month).slice(0, 7) <= lastMonth) {
    monthlyTotals.set(utcDateString(month).slice(0, 7), {
      totalSpent: 0,
      transactionCount: 0,
    });
    month.setUTCMonth(month.getUTCMonth() + 1);
  }

  for (const transaction of getTransactionsInRange(startDate, endDate)) {
    const monthKey = transaction.date.slice(0, 7);
    const totals = monthlyTotals.get(monthKey);
    if (totals) {
      totals.totalSpent += transaction.amount;
      totals.transactionCount += 1;
    }
  }

  return [...monthlyTotals.entries()].map(([monthKey, totals]) => ({
    month: monthKey,
    totalSpent: Math.round(totals.totalSpent * 100) / 100,
    transactionCount: totals.transactionCount,
    averageTransaction:
      totals.transactionCount > 0
        ? Math.round((totals.totalSpent / totals.transactionCount) * 100) / 100
        : 0,
  }));
}

function summarizeTransactions(
  period: string,
  selectedTransactions: typeof transactions,
  comparedTransactions?: typeof transactions,
) {
  const totalSpent = selectedTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  const transactionCount = selectedTransactions.length;
  const categoryTotals = new Map<string, number>();
  for (const transaction of selectedTransactions) {
    categoryTotals.set(
      transaction.category,
      (categoryTotals.get(transaction.category) ?? 0) + transaction.amount,
    );
  }
  const topCategory = [...categoryTotals.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? '';

  const comparedToPrevious =
    comparedTransactions && comparedTransactions.length > 0
      ? {
          spentChange:
            ((totalSpent -
              comparedTransactions.reduce((total, transaction) => total + transaction.amount, 0)) /
              comparedTransactions.reduce((total, transaction) => total + transaction.amount, 0)) *
            100,
          transactionChange:
            ((transactionCount - comparedTransactions.length) / comparedTransactions.length) * 100,
        }
      : undefined;

  return {
    period,
    totalSpent: Math.round(totalSpent * 100) / 100,
    transactionCount,
    averageTransaction:
      transactionCount > 0 ? Math.round((totalSpent / transactionCount) * 100) / 100 : 0,
    topCategory,
    ...(comparedToPrevious ? { comparedToPrevious } : {}),
  };
}

function summarizeCategories(selectedTransactions: typeof transactions) {
  const totalAmount = selectedTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  const categoryTotals = new Map<string, { amount: number; transactionCount: number }>();

  for (const transaction of selectedTransactions) {
    const current = categoryTotals.get(transaction.category) ?? { amount: 0, transactionCount: 0 };
    current.amount += transaction.amount;
    current.transactionCount += 1;
    categoryTotals.set(transaction.category, current);
  }

  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
    categories: [...categoryTotals.entries()]
      .map(([name, summary]) => {
        const metadata = categoryMetadata.find((category) => category.name === name);
        return {
          name,
          amount: Math.round(summary.amount * 100) / 100,
          percentage: totalAmount > 0 ? Math.round((summary.amount / totalAmount) * 1000) / 10 : 0,
          transactionCount: summary.transactionCount,
          color: metadata?.color ?? '',
          icon: metadata?.icon ?? '',
        };
      })
      .sort((left, right) => right.amount - left.amount),
  };
}

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
  const period = normalizePeriod(queryString(req.query['period']));
  const range = dateRange(period);
  const previousEndDate = shiftDate(range.startDate, -1);
  const previousStartDate = shiftDate(previousEndDate, -periodLength(period) + 1);
  const selectedTransactions = getTransactionsInRange(range.startDate, range.endDate);
  const comparedTransactions = getTransactionsInRange(previousStartDate, previousEndDate);

  res.json(
    summarizeTransactions(
      period,
      selectedTransactions,
      comparedTransactions.length > 0 ? comparedTransactions : undefined,
    ),
  );
});

mockApiRouter.get('/customers/:customerId/spending/categories', (req, res) => {
  const period = normalizePeriod(queryString(req.query['period']));
  const defaultRange = dateRange(period);
  const queryStartDate = queryString(req.query['startDate']);
  const queryEndDate = queryString(req.query['endDate']);
  const startDate = isDateOnly(queryStartDate) ? queryStartDate : defaultRange.startDate;
  const endDate = isDateOnly(queryEndDate)
    ? queryEndDate
    : isDateOnly(queryStartDate)
      ? utcDateString(new Date())
      : defaultRange.endDate;
  const categorySummary = summarizeCategories(getTransactionsInRange(startDate, endDate));

  res.json({
    dateRange: { startDate, endDate },
    ...categorySummary,
  });
});

mockApiRouter.get('/customers/:customerId/spending/trends', (req, res) => {
  const months = Math.min(24, Math.max(1, queryNumber(req.query['months'], 12)));
  const period = queryString(req.query['period']);
  const range = period
    ? dateRange(normalizePeriod(period))
    : (() => {
        const end = new Date();
        end.setUTCHours(0, 0, 0, 0);
        const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - months + 1, 1));
        return { startDate: utcDateString(start), endDate: utcDateString(end) };
      })();
  res.json({ trends: summarizeMonthlyTrends(range.startDate, range.endDate) });
});

mockApiRouter.get('/customers/:customerId/transactions', (req, res) => {
  const category = queryString(req.query['category']);
  const startDate = queryString(req.query['startDate'])?.slice(0, 10);
  const endDate = queryString(req.query['endDate'])?.slice(0, 10);
  const sortBy = queryString(req.query['sortBy']) ?? 'date_desc';
  const limit = Math.min(100, Math.max(1, queryNumber(req.query['limit'], 20)));
  const offset = Math.max(0, queryNumber(req.query['offset'], 0));

  const filtered = transactions
    .filter((transaction) => !category || transaction.category.toLowerCase() === category.trim().toLowerCase())
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
    categories: categoryMetadata,
    dateRangePresets,
  });
});
