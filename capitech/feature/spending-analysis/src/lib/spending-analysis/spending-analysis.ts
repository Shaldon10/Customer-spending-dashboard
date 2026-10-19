import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnInit, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import {
  customerSpendingFacade,
  isSpendingPeriod,
  type SpendingPeriod,
} from '@capitech/data-access';

type AnalysisData = {
  summary: Awaited<ReturnType<typeof customerSpendingFacade.getSpendingSummary>>;
  categories: Awaited<ReturnType<typeof customerSpendingFacade.getSpendingCategories>>;
  filters: Awaited<ReturnType<typeof customerSpendingFacade.getFilters>>;
};

@Component({
  selector: 'lib-spending-analysis',
  imports: [DecimalPipe],
  templateUrl: './spending-analysis.html',
  styleUrl: './spending-analysis.scss',
})
export class SpendingAnalysis implements OnInit {
  readonly customerId = '12345';
  readonly selectedPeriod = signal<SpendingPeriod>('30d');
  readonly data = signal<AnalysisData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('periodSelect')
  set periodSelect(select: ElementRef<HTMLSelectElement> | undefined) {
    if (select) {
      select.nativeElement.value = this.selectedPeriod();
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.restorePeriodPreference();
      void this.loadAnalysis();
    }
  }

  async loadAnalysis(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [summary, categories, filters] = await Promise.all([
        customerSpendingFacade.getSpendingSummary(this.customerId, {
          period: this.selectedPeriod(),
        }),
        customerSpendingFacade.getSpendingCategories(this.customerId, {
          period: this.selectedPeriod(),
        }),
        customerSpendingFacade.getFilters(this.customerId),
      ]);
      this.data.set({ summary, categories, filters });
    } catch {
      this.error.set('Spending analysis could not be loaded. Please try again.');
    } finally {
      this.loading.set(false);
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
    this.savePeriodPreference(value);
    void this.loadAnalysis();
  }

  private restorePeriodPreference(): void {
    try {
      const savedPeriod = localStorage.getItem(this.periodPreferenceKey());
      if (savedPeriod && isSpendingPeriod(savedPeriod)) {
        this.selectedPeriod.set(savedPeriod);
      }
    } catch (error) {
      console.error('Unable to restore the spending analysis period preference.', error);
    }
  }

  private savePeriodPreference(period: SpendingPeriod): void {
    try {
      localStorage.setItem(this.periodPreferenceKey(), period);
    } catch (error) {
      console.error('Unable to save the spending analysis period preference.', error);
    }
  }

  private periodPreferenceKey(): string {
    return `customer-spending-analysis-period:${this.customerId}`;
  }

  previousPeriodSpend(): number | null {
    const summary = this.data()?.summary;
    const spentChange = summary?.comparedToPrevious?.spentChange;
    if (!summary || spentChange === undefined || 1 + spentChange / 100 === 0) {
      return null;
    }
    return summary.totalSpent / (1 + spentChange / 100);
  }

  comparisonWidth(isPrevious: boolean): number {
    const current = this.data()?.summary.totalSpent ?? 0;
    const previous = this.previousPeriodSpend() ?? 0;
    const maximum = Math.max(current, previous);
    const amount = isPrevious ? previous : current;
    return maximum > 0 ? (amount / maximum) * 100 : 0;
  }
}
