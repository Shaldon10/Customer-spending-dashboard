import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { customerSpendingFacade, spendingPeriodDateRange } from '@capitech/data-access';
import { CustomerDashboard } from './customer-dashboard';

describe('CustomerDashboard', () => {
  let component: CustomerDashboard;
  let fixture: ComponentFixture<CustomerDashboard>;
  const periodPreferenceKey = 'customer-spending-dashboard-period:12345';

  const summary = {
    period: '30d' as const,
    totalSpent: 4250.75,
    transactionCount: 47,
    averageTransaction: 90.44,
    topCategory: 'Groceries',
    comparedToPrevious: { spentChange: 12.5, transactionChange: -3.2 },
  };
  const categories = {
    dateRange: { startDate: '2024-08-16', endDate: '2024-09-16' },
    totalAmount: 4250.75,
    categories: [{
      name: 'Groceries', amount: 1250.3, percentage: 29.4,
      transactionCount: 15, color: '#FF6B6B', icon: 'shopping-cart',
    }],
  };
  const trends = {
    trends: [{
      month: '2024-06', totalSpent: 4250.75, transactionCount: 47, averageTransaction: 90.44,
    }],
  };
  const transactions = {
    transactions: [{
      id: 'txn_123456', date: '2024-09-16T14:30:00Z', merchant: 'Pick n Pay',
      category: 'Groceries', amount: 245.8, description: 'Weekly groceries',
      paymentMethod: 'Credit Card', icon: 'shopping-cart', categoryColor: '#FF6B6B',
    }],
    pagination: { total: 1, limit: 4, offset: 0, hasMore: false },
  };
  const filters = {
    categories: [{ name: 'Groceries', color: '#FF6B6B', icon: 'shopping-cart' }],
    dateRangePresets: [
      { label: 'Last 7 days', value: '7d' },
      { label: 'Last 30 days', value: '30d' },
      { label: 'Last 90 days', value: '90d' },
      { label: 'Last year', value: '1y' },
    ],
  };

  beforeEach(async () => {
    localStorage.removeItem(periodPreferenceKey);
    jest.spyOn(customerSpendingFacade, 'getCustomerProfile').mockResolvedValue({
      customerId: '12345',
      name: 'John Doe',
      email: 'john.doe@email.com',
      joinDate: '2023-01-15',
      accountType: 'premium',
      totalSpent: 15420.5,
      currency: 'ZAR',
    });
    jest.spyOn(customerSpendingFacade, 'getSpendingSummary').mockImplementation(
      async (_customerId, params) => ({
        ...summary,
        period: params.period ?? '30d',
      }),
    );
    jest.spyOn(customerSpendingFacade, 'getSpendingCategories').mockResolvedValue(categories);
    jest.spyOn(customerSpendingFacade, 'getSpendingTrends').mockResolvedValue(trends);
    jest.spyOn(customerSpendingFacade, 'getTransactions').mockResolvedValue(transactions);
    jest.spyOn(customerSpendingFacade, 'getFilters').mockResolvedValue(filters);

    await TestBed.configureTestingModule({
      imports: [CustomerDashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads and displays dashboard data through the facade', async () => {
    await component.loadDashboard();
    fixture.detectChanges();

    expect(customerSpendingFacade.getSpendingSummary).toHaveBeenCalledWith('12345', { period: '30d' });
    expect(customerSpendingFacade.getSpendingCategories).toHaveBeenCalledWith('12345', { period: '30d' });
    expect(customerSpendingFacade.getSpendingTrends).toHaveBeenCalledWith('12345', { period: '30d' });
    expect(customerSpendingFacade.getTransactions).toHaveBeenCalledWith('12345', {
      limit: 4,
      ...spendingPeriodDateRange('30d'),
    });
    expect(customerSpendingFacade.getFilters).toHaveBeenCalledWith('12345');
    expect(customerSpendingFacade.getCustomerProfile).toHaveBeenCalledWith('12345');
    expect(fixture.nativeElement.textContent).toContain('4,250.75');
    expect(fixture.nativeElement.textContent).toContain('13%');
    expect(fixture.nativeElement.textContent).toContain('Welcome back, John Doe');
    expect(fixture.nativeElement.textContent).toContain('Pick n Pay');
  });

  it('shows a labeled, accessible spending chart with a value scale', async () => {
    await component.loadDashboard();
    fixture.detectChanges();

    const chart = fixture.nativeElement.querySelector('.trend-chart') as HTMLElement;
    expect(chart.getAttribute('aria-label')).toContain('Jun 24');
    expect(chart.getAttribute('aria-label')).toContain('R 4,250.75');
    expect(fixture.nativeElement.textContent).toContain('Spending in selected period by month (ZAR)');
    expect(fixture.nativeElement.textContent).toContain('R 5K');
    expect(fixture.nativeElement.textContent).toContain('Jun 24');
    expect(fixture.nativeElement.textContent).toContain('R 4.3K');
    expect(component.trendAxisTicks()).toEqual([5000, 3750, 2500, 1250, 0]);
    expect(component.trendBarHeight(4250.75)).toBeCloseTo(85.015);
  });

  it('reloads overview data when the selected period changes', async () => {
    await component.loadDashboard();
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '7d';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(component.selectedPeriod()).toBe('7d');
    expect(customerSpendingFacade.getSpendingSummary).toHaveBeenLastCalledWith('12345', { period: '7d' });
    expect(customerSpendingFacade.getSpendingTrends).toHaveBeenLastCalledWith('12345', { period: '7d' });
    expect(customerSpendingFacade.getTransactions).toHaveBeenLastCalledWith('12345', {
      limit: 4,
      ...spendingPeriodDateRange('7d'),
    });
    expect(localStorage.getItem(periodPreferenceKey)).toBe('7d');
  });

  it('restores the selected period before loading the dashboard', async () => {
    fixture.destroy();
    localStorage.setItem(periodPreferenceKey, '7d');

    fixture = TestBed.createComponent(CustomerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await component.loadDashboard();
    fixture.detectChanges();

    expect(component.selectedPeriod()).toBe('7d');
    expect(customerSpendingFacade.getSpendingSummary).toHaveBeenLastCalledWith('12345', { period: '7d' });
    expect(fixture.nativeElement.textContent).toContain('7d period');
  });

  it('hides the previous period summary while the selected period is loading', async () => {
    await component.loadDashboard();
    fixture.detectChanges();

    let resolveSevenDaySummary!: (
      value: Awaited<ReturnType<typeof customerSpendingFacade.getSpendingSummary>>,
    ) => void;
    jest.spyOn(customerSpendingFacade, 'getSpendingSummary').mockImplementation(
      (_customerId, params) =>
        params.period === '7d'
          ? new Promise((resolve) => {
              resolveSevenDaySummary = resolve;
            })
          : Promise.resolve(summary),
    );

    component.selectedPeriod.set('7d');
    const reload = component.loadDashboard();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.summary-grid')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Loading spending overview...');

    resolveSevenDaySummary({
      ...summary,
      period: '7d',
      totalSpent: 1544.25,
      transactionCount: 5,
    });
    await reload;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('7d period');
    expect(fixture.nativeElement.textContent).toContain('1,544.25');
    expect(fixture.nativeElement.textContent).not.toContain('30d period');
  });

  afterEach(() => {
    localStorage.removeItem(periodPreferenceKey);
    jest.restoreAllMocks();
  });
});
