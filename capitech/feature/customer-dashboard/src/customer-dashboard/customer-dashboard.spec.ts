import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { customerSpendingFacade } from '@capitech/data-access';
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

  beforeEach(async () => {
    jest.spyOn(customerSpendingFacade, 'getSpendingSummary').mockResolvedValue(summary);
    jest.spyOn(customerSpendingFacade, 'getSpendingCategories').mockResolvedValue(categories);
    jest.spyOn(customerSpendingFacade, 'getSpendingTrends').mockResolvedValue(trends);
    jest.spyOn(customerSpendingFacade, 'getTransactions').mockResolvedValue(transactions);

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

    expect(customerSpendingFacade.getSpendingSummary).toHaveBeenCalledWith('12345');
    expect(customerSpendingFacade.getSpendingCategories).toHaveBeenCalledWith('12345');
    expect(customerSpendingFacade.getSpendingTrends).toHaveBeenCalledWith('12345');
    expect(customerSpendingFacade.getTransactions).toHaveBeenCalledWith('12345', { limit: 4 });
    expect(fixture.nativeElement.textContent).toContain('4,250.75');
    expect(fixture.nativeElement.textContent).toContain('Pick n Pay');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
