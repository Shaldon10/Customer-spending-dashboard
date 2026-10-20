import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { customerSpendingFacade } from '@capitech/data-access';
import { AuthService } from '@capitech/login';

type GoalsData = Awaited<ReturnType<typeof customerSpendingFacade.getGoals>>;

@Component({
  selector: 'lib-budget-goals',
  imports: [DecimalPipe],
  templateUrl: './budget-goals.html',
  styleUrl: './budget-goals.scss',
})
export class BudgetGoals implements OnInit {
  customerId = '';
  readonly data = signal<GoalsData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly totalBudget = computed(
    () => this.data()?.goals.reduce((total, goal) => total + goal.monthlyBudget, 0) ?? 0,
  );
  readonly totalSpent = computed(
    () => this.data()?.goals.reduce((total, goal) => total + goal.currentSpent, 0) ?? 0,
  );
  readonly overallPercentage = computed(() =>
    this.totalBudget() > 0 ? (this.totalSpent() / this.totalBudget()) * 100 : 0,
  );
  readonly daysRemaining = computed(() =>
    Math.max(...(this.data()?.goals.map((goal) => goal.daysRemaining) ?? [0])),
  );

  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.customerId = this.auth.getCustomerId() ?? '';
      if (!this.customerId) {
        this.error.set('Customer identity is unavailable. Please sign in again.');
        this.loading.set(false);
        return;
      }
      void this.loadGoals();
    }
  }

  async loadGoals(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.data.set(await customerSpendingFacade.getGoals(this.customerId));
    } catch {
      this.error.set('Budget goals could not be loaded. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  progressValue(percentage: number): number {
    return Math.min(100, Math.max(0, percentage));
  }

  overallStatus(): string {
    const goals = this.data()?.goals ?? [];
    if (goals.some((goal) => goal.status === 'exceeded')) {
      return 'Over budget in at least one category';
    }
    if (goals.some((goal) => goal.status === 'warning')) {
      return 'Approaching a category limit';
    }
    return 'On track for this month';
  }
}
