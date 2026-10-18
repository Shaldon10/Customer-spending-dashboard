import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { customerSpendingFacade } from '@capitech/data-access';

type DashboardData = {
  summary: Awaited<ReturnType<typeof customerSpendingFacade.getSpendingSummary>>;
  categories: Awaited<ReturnType<typeof customerSpendingFacade.getSpendingCategories>>;
  trends: Awaited<ReturnType<typeof customerSpendingFacade.getSpendingTrends>>;
  transactions: Awaited<ReturnType<typeof customerSpendingFacade.getTransactions>>;
};

@Component({
  selector: 'lib-customer-dashboard',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.scss',
})
export class CustomerDashboard implements OnInit {
  readonly customerId = '12345';
  readonly data = signal<DashboardData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.loadDashboard();
    }
  }

  async loadDashboard(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [summary, categories, trends, transactions] = await Promise.all([
        customerSpendingFacade.getSpendingSummary(this.customerId),
        customerSpendingFacade.getSpendingCategories(this.customerId),
        customerSpendingFacade.getSpendingTrends(this.customerId),
        customerSpendingFacade.getTransactions(this.customerId, { limit: 4 }),
      ]);
      this.data.set({ summary, categories, trends, transactions });
    } catch {
      this.error.set('Dashboard data could not be loaded. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  trendBarHeight(amount: number): number {
    const trends = this.data()?.trends.trends ?? [];
    const maximum = Math.max(...trends.map((trend) => trend.totalSpent), 0);
    return maximum > 0 ? Math.max((amount / maximum) * 100, 10) : 0;
  }

  formatMonth(month: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      month: 'short',
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
