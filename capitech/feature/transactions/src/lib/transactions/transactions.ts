import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnInit, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import {
  customerSpendingFacade,
  isSpendingPeriod,
  spendingPeriodDateRange,
  type SpendingPeriod,
} from '@capitech/data-access';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  InfiniteRowModelModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type DateFilterModel,
  type GridApi,
  type GridReadyEvent,
  type IDatasource,
  type IGetRowsParams,
  type SortModelItem,
  type TextFilterModel,
} from 'ag-grid-community';
import { AuthService } from '@capitech/login';

const pageSize = 20;
const zarCurrency = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
});

type TransactionRow = Awaited<
  ReturnType<typeof customerSpendingFacade.getTransactions>
>['transactions'][number];
type TransactionsSummary = Awaited<
  ReturnType<typeof customerSpendingFacade.getSpendingSummary>
>;
type SortBy = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

ModuleRegistry.registerModules([AllCommunityModule, InfiniteRowModelModule]);

@Component({
  selector: 'lib-transactions',
  imports: [AgGridAngular, DecimalPipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  customerId = '';
  readonly selectedPeriod = signal<SpendingPeriod>('30d');
  readonly data = signal<TransactionsSummary | null>(null);
  readonly filters = signal<
    Awaited<ReturnType<typeof customerSpendingFacade.getFilters>> | null
  >(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly theme = themeQuartz;
  readonly rowModelType = 'infinite' as const;
  readonly pagination = true;
  readonly paginationPageSize = pageSize;
  readonly cacheBlockSize = pageSize;
  readonly maxConcurrentDatasourceRequests = 1;
  readonly defaultColDef: ColDef<TransactionRow> = {
    resizable: true,
    sortable: false,
  };
  readonly columnDefs: ColDef<TransactionRow>[] = [
    { field: 'merchant', headerName: 'Merchant', minWidth: 150, flex: 1.2 },
    { field: 'description', headerName: 'Description', minWidth: 180, flex: 1.5 },
    {
      field: 'category',
      headerName: 'Category',
      minWidth: 130,
      filter: 'agTextColumnFilter',
      suppressHeaderFilterButton: false,
      filterParams: {
        filterOptions: ['equals'],
        maxNumConditions: 1,
        buttons: ['apply', 'reset'],
        closeOnApply: true,
      },
    },
    {
      field: 'date',
      headerName: 'Date',
      minWidth: 150,
      sortable: true,
      sortingOrder: ['desc', 'asc'],
      filter: 'agDateColumnFilter',
      suppressHeaderFilterButton: false,
      filterValueGetter: ({ data }) => (data ? this.parseGridDate(data.date) : null),
      filterParams: {
        filterOptions: ['equals', 'lessThan', 'greaterThan', 'inRange'],
        maxNumConditions: 1,
        buttons: ['apply', 'reset'],
        closeOnApply: true,
        comparator: (filterDate: Date, cellDate: Date | null) => {
          if (!cellDate) {
            return -1;
          }
          const cellDay = Date.UTC(
            cellDate.getFullYear(),
            cellDate.getMonth(),
            cellDate.getDate(),
          );
          const filterDay = Date.UTC(
            filterDate.getFullYear(),
            filterDate.getMonth(),
            filterDate.getDate(),
          );
          return cellDay === filterDay ? 0 : cellDay < filterDay ? -1 : 1;
        },
      },
      valueFormatter: ({ value }) => (value ? this.formatDate(value) : ''),
    },
    { field: 'paymentMethod', headerName: 'Payment method', minWidth: 150 },
    {
      field: 'amount',
      headerName: 'Amount',
      minWidth: 150,
      sortable: true,
      sortingOrder: ['asc', 'desc'],
      cellClass: 'numeric',
      valueFormatter: ({ value }) => (typeof value === 'number' ? `− ${zarCurrency.format(value)}` : ''),
    },
  ];

  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);
  private activeRequests = 0;
  private gridApi: GridApi<TransactionRow> | null = null;

  @ViewChild('periodSelect')
  set periodSelect(select: ElementRef<HTMLSelectElement> | undefined) {
    if (select) {
      select.nativeElement.value = this.selectedPeriod();
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.customerId = this.auth.getCustomerId() ?? '';
      if (!this.customerId) {
        this.error.set('Customer identity is unavailable. Please sign in again.');
        this.loading.set(false);
        return;
      }
      this.restorePeriodPreference();
      void this.loadSummary();
    }
  }

  async loadSummary(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [summary, filters] = await Promise.all([
        customerSpendingFacade.getSpendingSummary(this.customerId, {
          period: this.selectedPeriod(),
        }),
        customerSpendingFacade.getFilters(this.customerId),
      ]);
      this.data.set(summary);
      this.filters.set(filters);
    } catch {
      this.error.set('Transaction summary could not be loaded. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  retry(): void {
    void this.loadSummary();
    this.gridApi?.refreshInfiniteCache();
  }

  onPeriodChange(event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) {
      return;
    }
    const value = event.target.value;
    if (!isSpendingPeriod(value)) {
      return;
    }
    this.selectedPeriod.set(value);
    this.savePeriodPreference(value);
    void this.loadSummary();
    this.gridApi?.refreshInfiniteCache();
  }

  onGridReady(event: GridReadyEvent<TransactionRow>): void {
    this.gridApi = event.api;
    event.api.setGridOption('datasource', this.createDatasource());
  }

  private createDatasource(): IDatasource {
    return {
      getRows: (params) => {
        void this.loadRows(params);
      },
    };
  }

  async loadRows(params: IGetRowsParams<TransactionRow>): Promise<void> {
    this.activeRequests += 1;
    this.loading.set(true);
    this.error.set(null);

    try {
      const filters = (params.filterModel ?? {}) as Record<string, unknown>;
      const categoryFilter = filters['category'] as TextFilterModel | undefined;
      const dateFilter = filters['date'] as DateFilterModel | undefined;
      const category =
        categoryFilter?.filterType === 'text' && categoryFilter.type === 'equals'
          ? categoryFilter.filter ?? ''
          : '';
      const periodRange = spendingPeriodDateRange(this.selectedPeriod());
      const filterRange = this.dateFilterRange(dateFilter);
      const startDate =
        filterRange.startDate > periodRange.startDate
          ? filterRange.startDate
          : periodRange.startDate;
      const endDate =
        filterRange.endDate && filterRange.endDate < periodRange.endDate
          ? filterRange.endDate
          : periodRange.endDate;
      const response = await customerSpendingFacade.getTransactions(this.customerId, {
        limit: params.endRow - params.startRow,
        offset: params.startRow,
        category: category || undefined,
        startDate,
        endDate,
        sortBy: this.sortFromModel(params.sortModel),
      });
      params.successCallback(response.transactions, response.pagination.total);
    } catch {
      this.error.set('Transactions could not be loaded. Please try again.');
      params.failCallback();
    } finally {
      this.activeRequests -= 1;
      this.loading.set(this.activeRequests > 0);
    }
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(date));
  }

  private restorePeriodPreference(): void {
    try {
      const savedPeriod = localStorage.getItem(this.periodPreferenceKey());
      if (savedPeriod && isSpendingPeriod(savedPeriod)) {
        this.selectedPeriod.set(savedPeriod);
      }
    } catch (error) {
      console.error('Unable to restore the transactions period preference.', error);
    }
  }

  private savePeriodPreference(period: SpendingPeriod): void {
    try {
      localStorage.setItem(this.periodPreferenceKey(), period);
    } catch (error) {
      console.error('Unable to save the transactions period preference.', error);
    }
  }

  private periodPreferenceKey(): string {
    return `customer-spending-transactions-period:${this.customerId}`;
  }

  private dateFilterRange(
    filter: DateFilterModel | undefined,
  ): { startDate: string; endDate: string } {
    if (!filter?.dateFrom) {
      return { startDate: '', endDate: '' };
    }

    const dateFrom = filter.dateFrom.slice(0, 10);
    const dateTo = filter.dateTo?.slice(0, 10);
    switch (filter.type) {
      case 'equals':
        return { startDate: dateFrom, endDate: dateFrom };
      case 'inRange':
        return {
          startDate: dateFrom,
          endDate: dateTo ?? dateFrom,
        };
      case 'greaterThan':
        return { startDate: this.shiftDate(dateFrom, 1), endDate: '' };
      case 'lessThan':
        return { startDate: '', endDate: this.shiftDate(dateFrom, -1) };
      default:
        return { startDate: '', endDate: '' };
    }
  }

  private sortFromModel(sortModel: SortModelItem[]): SortBy {
    const sort = sortModel[0];
    if (!sort || (sort.colId !== 'date' && sort.colId !== 'amount')) {
      return 'date_desc';
    }
    if (sort.colId === 'date') {
      return sort.sort === 'asc' ? 'date_asc' : 'date_desc';
    }
    return sort.sort === 'asc' ? 'amount_asc' : 'amount_desc';
  }

  private shiftDate(date: string, days: number): string {
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    const shiftedDate = new Date(Date.UTC(year, month - 1, day + days));
    return shiftedDate.toISOString().slice(0, 10);
  }

  private parseGridDate(date: string): Date {
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
