import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { customerSpendingFacade } from '@capitech/data-access';

const pageSize = 20;

type TransactionsData = {
  transactions: Awaited<ReturnType<typeof customerSpendingFacade.getTransactions>>;
  filters: Awaited<ReturnType<typeof customerSpendingFacade.getFilters>>;
  summary: Awaited<ReturnType<typeof customerSpendingFacade.getSpendingSummary>>;
};
type SortBy = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

function isSortBy(value: string): value is SortBy {
  return ['date_desc', 'date_asc', 'amount_desc', 'amount_asc'].some(
    (sortBy) => sortBy === value,
  );
}

@Component({
  selector: 'lib-transactions',
  imports: [DecimalPipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  readonly customerId = '12345';
  readonly data = signal<TransactionsData | null>(null);
  readonly category = signal('');
  readonly sortBy = signal<SortBy>('date_desc');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly offset = signal(0);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.loadTransactions();
    }
  }

  async loadTransactions(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [transactions, filters, summary] = await Promise.all([
        customerSpendingFacade.getTransactions(this.customerId, {
          limit: pageSize,
          offset: this.offset(),
          category: this.category() || undefined,
          startDate: this.startDate() || undefined,
          endDate: this.endDate() || undefined,
          sortBy: this.sortBy(),
        }),
        customerSpendingFacade.getFilters(this.customerId),
        customerSpendingFacade.getSpendingSummary(this.customerId),
      ]);
      this.data.set({ transactions, filters, summary });
    } catch {
      this.error.set('Transactions could not be loaded. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  onCategoryChange(event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) {
      return;
    }
    this.category.set(event.target.value);
    this.offset.set(0);
    void this.loadTransactions();
  }

  onSortChange(event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) {
      return;
    }
    const value = event.target.value;
    if (!isSortBy(value)) {
      return;
    }
    this.sortBy.set(value);
    this.offset.set(0);
    void this.loadTransactions();
  }

  onStartDateChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.startDate.set(event.target.value);
    }
  }

  onEndDateChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.endDate.set(event.target.value);
    }
  }

  applyDateRange(): void {
    this.offset.set(0);
    void this.loadTransactions();
  }

  previousPage(): void {
    if (this.offset() >= pageSize) {
      this.offset.update((offset) => offset - pageSize);
      void this.loadTransactions();
    }
  }

  nextPage(): void {
    if (this.data()?.transactions.pagination.hasMore) {
      this.offset.update((offset) => offset + pageSize);
      void this.loadTransactions();
    }
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(date));
  }
}
