import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { customerSpendingFacade } from '@capitech/data-access';

type CustomerProfileData = Awaited<ReturnType<typeof customerSpendingFacade.getCustomerProfile>>;

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  readonly customerId = '12345';
  readonly sidebarHidden = signal(false);
  readonly profile = signal<CustomerProfileData | null>(null);
  readonly loading = signal(true);
  readonly initials = computed(() => {
    const name = this.profile()?.name;
    return name
      ? name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
      : '...';
  });
  readonly profileId = computed(() => {
    const customerId = this.profile()?.customerId;
    return customerId ? `Customer ID ${customerId}` : this.loading() ? 'Loading profile...' : 'Profile unavailable';
  });
  readonly totalSpent = computed(() => {
    const profile = this.profile();
    return profile
      ? `${profile.currency} ${profile.totalSpent.toLocaleString('en-ZA', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : this.loading() ? 'Loading...' : 'Unavailable';
  });

  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.loadProfile();
    }
  }

  toggleSidebar(): void {
    this.sidebarHidden.update((hidden) => !hidden);
  }

  private async loadProfile(): Promise<void> {
    try {
      this.profile.set(await customerSpendingFacade.getCustomerProfile(this.customerId));
    } catch {
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
