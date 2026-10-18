import { ComponentFixture, TestBed } from '@angular/core/testing';
import { customerSpendingFacade } from '@capitech/data-access';
import { Transactions } from './transactions';

describe('Transactions', () => {
  let component: Transactions;
  let fixture: ComponentFixture<Transactions>;

  const transactions = {
    transactions: [{
      id: 'txn_123456', date: '2024-09-16T14:30:00Z', merchant: 'Pick n Pay',
      category: 'Groceries', amount: 245.8, description: 'Weekly groceries',
      paymentMethod: 'Credit Card', icon: 'shopping-cart', categoryColor: '#FF6B6B',
    }],
    pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
  };
  const filters = {
    categories: [{ name: 'Groceries', color: '#FF6B6B', icon: 'shopping-cart' }],
    dateRangePresets: [{ label: 'Last 30 days', value: '30d' }],
  };
  const summary = {
    period: '30d' as const,
    totalSpent: 4250.75,
    transactionCount: 47,
    averageTransaction: 90.44,
    topCategory: 'Groceries',
  };

  beforeEach(async () => {
    jest.spyOn(customerSpendingFacade, 'getTransactions').mockResolvedValue(transactions);
    jest.spyOn(customerSpendingFacade, 'getFilters').mockResolvedValue(filters);
    jest.spyOn(customerSpendingFacade, 'getSpendingSummary').mockResolvedValue(summary);

    await TestBed.configureTestingModule({
      imports: [Transactions]
    }).compileComponents();

    fixture = TestBed.createComponent(Transactions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads and displays transactions and available category filters', async () => {
    await component.loadTransactions();
    fixture.detectChanges();

    expect(customerSpendingFacade.getTransactions).toHaveBeenCalledWith('12345', {
      limit: 20,
      offset: 0,
      category: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: 'date_desc',
    });
    expect(customerSpendingFacade.getFilters).toHaveBeenCalledWith('12345');
    expect(fixture.nativeElement.textContent).toContain('Pick n Pay');
    expect(fixture.nativeElement.textContent).toContain('Weekly groceries');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
