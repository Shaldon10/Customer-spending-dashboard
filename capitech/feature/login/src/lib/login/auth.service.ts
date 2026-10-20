import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { customerSpendingFacade } from '@capitech/data-access';

const AUTH_STORAGE_KEY = 'capitech-demo-customer-id';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);

  isAuthenticated(): boolean {
    return this.getCustomerId() !== null;
  }

  getCustomerId(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const customerId = localStorage.getItem(AUTH_STORAGE_KEY);
    return customerId?.trim() || null;
  }

  async login(username: string, password: string): Promise<boolean> {
    const { customerId } = await customerSpendingFacade.authenticate(username, password);
    if (!customerId?.trim()) {
      return false;
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(AUTH_STORAGE_KEY, customerId);
    }
    return true;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
}
