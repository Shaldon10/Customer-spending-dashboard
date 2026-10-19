import { ComponentFixture, TestBed } from '@angular/core/testing';
import { customerSpendingFacade, spendingPeriodDateRange } from '@capitech/data-access';
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
    jest.spyOn(customerSpendingFacade, 'getTransactions').mockResolvedValue(transactions);
    jest.spyOn(customerSpendingFacade, 'getSpendingSummary').mockResolvedValue(summary);
    jest.spyOn(customerSpendingFacade, 'getFilters').mockResolvedValue(filters);

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
    const periodRange = spendingPeriodDateRange('90d');
    component.selectedPeriod.set('90d');
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
          dateFrom: `${periodRange.startDate} 00:00:00`,
          dateTo: `${periodRange.endDate} 00:00:00`,
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
      startDate: periodRange.startDate,
      endDate: periodRange.endDate,
      sortBy: 'amount_asc',
    });
    expect(successCallback).toHaveBeenCalledWith(transactions.transactions, 1);
    expect(failCallback).not.toHaveBeenCalled();
  });

  it('loads the summary for the selected period', async () => {
    await component.loadSummary();
    fixture.detectChanges();

    expect(customerSpendingFacade.getSpendingSummary).toHaveBeenCalledWith('12345', {
      period: '30d',
    });
    expect(customerSpendingFacade.getFilters).toHaveBeenCalledWith('12345');
    expect(fixture.nativeElement.textContent).toContain('Last 30 days');
  });

  it('updates the summary and transaction period when changed', async () => {
    await component.loadSummary();
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '7d';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(component.selectedPeriod()).toBe('7d');
    expect(customerSpendingFacade.getSpendingSummary).toHaveBeenLastCalledWith('12345', {
      period: '7d',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
