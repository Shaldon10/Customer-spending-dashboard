import { ComponentFixture, TestBed } from '@angular/core/testing';
import { customerSpendingFacade } from '@capitech/data-access';
import type { IGetRowsParams } from 'ag-grid-community';
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
  const summary = {
    period: '30d' as const,
    totalSpent: 4250.75,
    transactionCount: 47,
    averageTransaction: 90.44,
    topCategory: 'Groceries',
  };

  beforeEach(async () => {
    jest.spyOn(customerSpendingFacade, 'getTransactions').mockResolvedValue(transactions);
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

  it('loads filtered rows through the infinite-row datasource', async () => {
    const successCallback = jest.fn();
    const failCallback = jest.fn();
    const params = {
      startRow: 0,
      endRow: 20,
      filterModel: {
        category: { filterType: 'text', type: 'equals', filter: 'Groceries' },
        date: {
          filterType: 'date',
          type: 'inRange',
          dateFrom: '2024-09-01 00:00:00',
          dateTo: '2024-09-30 00:00:00',
        },
      },
      sortModel: [{ colId: 'amount', sort: 'asc' }],
      successCallback,
      failCallback,
    } as unknown as IGetRowsParams;

    await component.loadRows(params);

    expect(customerSpendingFacade.getTransactions).toHaveBeenCalledWith('12345', {
      limit: 20,
      offset: 0,
      category: 'Groceries',
      startDate: '2024-09-01',
      endDate: '2024-09-30',
      sortBy: 'amount_asc',
    });
    expect(successCallback).toHaveBeenCalledWith(transactions.transactions, 1);
    expect(failCallback).not.toHaveBeenCalled();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
