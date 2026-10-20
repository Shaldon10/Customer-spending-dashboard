import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { customerSpendingFacade } from '@capitech/data-access';
import { AuthService } from '@capitech/login';

type CustomerProfileData = Awaited<ReturnType<typeof customerSpendingFacade.getCustomerProfile>>;

@Component({
  selector: 'lib-customer-profile',
  imports: [DecimalPipe],
  templateUrl: './customer-profile.html',
  styleUrl: './customer-profile.scss'
})
export class CustomerProfile implements OnInit {
  customerId = '';
  readonly profile = signal<CustomerProfileData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

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
      void this.loadProfile();
    }
  }

  async loadProfile(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.profile.set(await customerSpendingFacade.getCustomerProfile(this.customerId));
    } catch {
      this.error.set('Customer profile could not be loaded. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  formatJoinDate(joinDate: string): string {
    return new Intl.DateTimeFormat('en-ZA', {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(new Date(`${joinDate}T12:00:00Z`));
  }
}