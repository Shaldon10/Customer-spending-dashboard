import { ComponentFixture, TestBed } from '@angular/core/testing';
import { customerSpendingFacade } from '@capitech/data-access';
import { SpendingAnalysis } from './spending-analysis';

describe('SpendingAnalysis', () => {
  let component: SpendingAnalysis;
  let fixture: ComponentFixture<SpendingAnalysis>;

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
    jest.spyOn(customerSpendingFacade, 'getSpendingSummary').mockResolvedValue(summary);
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
