import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { customerSpendingFacade, spendingPeriodDateRange } from '@capitech/data-access';
import { CustomerDashboard } from './customer-dashboard';

describe('CustomerDashboard', () => {
  let component: CustomerDashboard;
  let fixture: ComponentFixture<CustomerDashboard>;

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
    jest.spyOn(customerSpendingFacade, 'getSpendingSummary').mockResolvedValue(summary);
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
    expect(customerSpendingFacade.getSpendingTrends).toHaveBeenCalledWith('12345');
    expect(customerSpendingFacade.getTransactions).toHaveBeenCalledWith('12345', {
      limit: 4,
      ...spendingPeriodDateRange('30d'),
    });
    expect(customerSpendingFacade.getFilters).toHaveBeenCalledWith('12345');
    expect(fixture.nativeElement.textContent).toContain('4,250.75');
    expect(fixture.nativeElement.textContent).toContain('13%');
    expect(fixture.nativeElement.textContent).toContain('Pick n Pay');
  });

  it('shows a labeled, accessible spending chart with a value scale', async () => {
    await component.loadDashboard();
    fixture.detectChanges();

    const chart = fixture.nativeElement.querySelector('.trend-chart') as HTMLElement;
    expect(chart.getAttribute('aria-label')).toContain('Jun 24');
    expect(chart.getAttribute('aria-label')).toContain('R 4,250.75');
    expect(fixture.nativeElement.textContent).toContain('Monthly spending in ZAR');
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
    expect(customerSpendingFacade.getTransactions).toHaveBeenLastCalledWith('12345', {
      limit: 4,
      ...spendingPeriodDateRange('7d'),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
