import { ComponentFixture, TestBed } from '@angular/core/testing';
import { customerSpendingFacade } from '@capitech/data-access';
import { SpendingAnalysis } from './spending-analysis';

describe('SpendingAnalysis', () => {
  let component: SpendingAnalysis;
  let fixture: ComponentFixture<SpendingAnalysis>;
  const periodPreferenceKey = 'customer-spending-analysis-period:12345';

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
    localStorage.setItem('capitech-demo-customer-id', '12345');
    localStorage.removeItem(periodPreferenceKey);
    jest.spyOn(customerSpendingFacade, 'getSpendingSummary').mockImplementation(
      async (_customerId, params) => ({
        ...summary,
        period: params.period ?? '30d',
      }),
    );
    jest.spyOn(customerSpendingFacade, 'getSpendingCategories').mockResolvedValue(categories);
    jest.spyOn(customerSpendingFacade, 'getFilters').mockResolvedValue(filters);

    await TestBed.configureTestingModule({
      imports: [SpendingAnalysis]
    }).compileComponents();

    fixture = TestBed.createComponent(SpendingAnalysis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads spending summary, category breakdown, and filter presets', async () => {
    await component.loadAnalysis();
    fixture.detectChanges();

    expect(customerSpendingFacade.getSpendingSummary).toHaveBeenCalledWith('12345', { period: '30d' });
    expect(customerSpendingFacade.getSpendingCategories).toHaveBeenCalledWith('12345', { period: '30d' });
    expect(customerSpendingFacade.getFilters).toHaveBeenCalledWith('12345');
    expect(fixture.nativeElement.textContent).toContain('4,250.75');
    expect(fixture.nativeElement.textContent).toContain('Groceries');
    expect(fixture.nativeElement.textContent).toContain('+13%');
    expect(fixture.nativeElement.textContent).toContain(
      'Spending is up 13% compared with the previous period.',
    );
  });

  it('updates the selected period and saves the preference', async () => {
    await component.loadAnalysis();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '7d';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.selectedPeriod()).toBe('7d');
    expect(customerSpendingFacade.getSpendingSummary).toHaveBeenLastCalledWith('12345', { period: '7d' });
    expect(localStorage.getItem(periodPreferenceKey)).toBe('7d');
    expect(fixture.nativeElement.textContent).toContain('7d period');
  });

  it('restores the selected period before loading the analysis', async () => {
    fixture.destroy();
    localStorage.setItem(periodPreferenceKey, '7d');

    fixture = TestBed.createComponent(SpendingAnalysis);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await component.loadAnalysis();
    fixture.detectChanges();

    expect(component.selectedPeriod()).toBe('7d');
    expect(customerSpendingFacade.getSpendingSummary).toHaveBeenLastCalledWith('12345', { period: '7d' });
    expect(customerSpendingFacade.getSpendingCategories).toHaveBeenLastCalledWith('12345', { period: '7d' });
    expect(fixture.nativeElement.textContent).toContain('7d period');
  });

  afterEach(() => {
    localStorage.removeItem('capitech-demo-customer-id');
    localStorage.removeItem(periodPreferenceKey);
    jest.restoreAllMocks();
  });
});
