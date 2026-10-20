import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { customerSpendingFacade } from '@capitech/data-access';
import { AuthService } from '@capitech/login';

type CustomerProfileData = Awaited<ReturnType<typeof customerSpendingFacade.getCustomerProfile>>;

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoginPage = signal(this.isLoginUrl(this.router.url));
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

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.isLoginPage.set(this.isLoginUrl(event.urlAfterRedirects));
        if (!this.isLoginPage()) {
          void this.loadProfile();
        }
      });

    if (isPlatformBrowser(this.platformId) && !this.isLoginPage()) {
      void this.loadProfile();
    }
  }

  toggleSidebar(): void {
    this.sidebarHidden.update((hidden) => !hidden);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  private isLoginUrl(url: string): boolean {
    return url.split(/[?#]/, 1)[0] === '/login';
  }

  private async loadProfile(): Promise<void> {
    const customerId = this.auth.getCustomerId();
    if (!customerId) {
      this.profile.set(null);
      this.loading.set(false);
      return;
    }

    try {
      this.profile.set(await customerSpendingFacade.getCustomerProfile(customerId));
    } catch {
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
