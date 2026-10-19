import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  customerSpendingFacade,
  isSpendingPeriod,
  spendingPeriodDateRange,
  type SpendingPeriod,
} from '@capitech/data-access';

type DashboardData = {
  summary: Awaited<ReturnType<typeof customerSpendingFacade.getSpendingSummary>>;
  categories: Awaited<ReturnType<typeof customerSpendingFacade.getSpendingCategories>>;
  trends: Awaited<ReturnType<typeof customerSpendingFacade.getSpendingTrends>>;
  transactions: Awaited<ReturnType<typeof customerSpendingFacade.getTransactions>>;
  filters: Awaited<ReturnType<typeof customerSpendingFacade.getFilters>>;
};

const compactCurrency = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const fullCurrency = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

@Component({
  selector: 'lib-customer-dashboard',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.scss',
})
export class CustomerDashboard implements OnInit {
  readonly customerId = '12345';
  readonly selectedPeriod = signal<SpendingPeriod>('30d');
  readonly data = signal<DashboardData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly platformId = inject(PLATFORM_ID);
  private loadSequence = 0;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.loadDashboard();
    }
  }

  async loadDashboard(): Promise<void> {
    const requestSequence = ++this.loadSequence;
    this.loading.set(true);
    this.error.set(null);

    try {
      const period = this.selectedPeriod();
      const dateRange = spendingPeriodDateRange(period);
      const [summary, categories, trends, transactions, filters] = await Promise.all([
        customerSpendingFacade.getSpendingSummary(this.customerId, { period }),
        customerSpendingFacade.getSpendingCategories(this.customerId, { period }),
        customerSpendingFacade.getSpendingTrends(this.customerId, { period }),
        customerSpendingFacade.getTransactions(this.customerId, {
          limit: 4,
          ...dateRange,
        }),
        customerSpendingFacade.getFilters(this.customerId),
      ]);
      if (requestSequence === this.loadSequence) {
        this.data.set({ summary, categories, trends, transactions, filters });
      }
    } catch {
      if (requestSequence === this.loadSequence) {
        this.error.set('Dashboard data could not be loaded. Please try again.');
      }
    } finally {
      if (requestSequence === this.loadSequence) {
        this.loading.set(false);
      }
    }
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
    void this.loadDashboard();
  }

  trendBarHeight(amount: number): number {
    const maximum = this.trendAxisMaximum();
    return maximum > 0 ? (amount / maximum) * 100 : 0;
  }

  trendAxisMaximum(): number {
    const trends = this.data()?.trends.trends ?? [];
    const maximum = Math.max(...trends.map((trend) => trend.totalSpent), 0);
    if (maximum === 0) {
      return 1;
    }

    const magnitude = 10 ** Math.floor(Math.log10(maximum));
    const normalized = maximum / magnitude;
    const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return step * magnitude;
  }

  trendAxisTicks(): number[] {
    const maximum = this.trendAxisMaximum();
    return Array.from({ length: 5 }, (_, index) => (maximum * (4 - index)) / 4);
  }

  formatCompactCurrency(amount: number): string {
    return `R ${compactCurrency.format(amount)}`;
  }

  trendChartDescription(): string {
    const trends = this.data()?.trends.trends ?? [];
    if (trends.length === 0) {
      return 'No monthly spending data available.';
    }
    return `Monthly spending in South African rand: ${trends
      .map((trend) => `${this.formatMonth(trend.month)} R ${fullCurrency.format(trend.totalSpent)}`)
      .join(', ')}.`;
  }

  formatMonth(month: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      month: 'short',
      year: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(`${month}-01T12:00:00Z`));
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(date));
  }
}
