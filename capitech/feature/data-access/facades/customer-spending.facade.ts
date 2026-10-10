import axios, { type AxiosInstance } from 'axios';

import type { components } from '../generated-code/customer-spending-api';

export type GetSpendingSummaryParams = {
  period?: components['schemas']['SpendingSummary']['period'];
};

export type GetSpendingCategoriesParams = {
  period?: components['schemas']['SpendingSummary']['period'];
  startDate?: string;
  endDate?: string;
};

export type GetSpendingTrendsParams = {
  months?: number;
};

export type GetTransactionsParams = {
  limit?: number;
  offset?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
};

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class CustomerSpendingFacade {
  constructor(private readonly client: AxiosInstance = apiClient) {}

  private customerPath(customerId: string, suffix: string): string {
    return `/customers/${encodeURIComponent(customerId)}${suffix}`;
  }

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const { data } = await this.client.get<T>(url, { params });
    return data;
  }

  public async getCustomerProfile(
    customerId: string,
  ): Promise<components['schemas']['CustomerProfile']> {
    return this.get<components['schemas']['CustomerProfile']>(
      this.customerPath(customerId, '/profile'),
    );
  }

  public async getSpendingSummary(
    customerId: string,
    params: GetSpendingSummaryParams = {},
  ): Promise<components['schemas']['SpendingSummary']> {
    return this.get<components['schemas']['SpendingSummary']>(
      this.customerPath(customerId, '/spending/summary'),
      params,
    );
  }

  public async getSpendingCategories(
    customerId: string,
    params: GetSpendingCategoriesParams = {},
  ): Promise<components['schemas']['CategoryBreakdownResponse']> {
    return this.get<components['schemas']['CategoryBreakdownResponse']>(
      this.customerPath(customerId, '/spending/categories'),
      params,
    );
  }

  public async getSpendingTrends(
    customerId: string,
    params: GetSpendingTrendsParams = {},
  ): Promise<components['schemas']['SpendingTrendsResponse']> {
    return this.get<components['schemas']['SpendingTrendsResponse']>(
      this.customerPath(customerId, '/spending/trends'),
      params,
    );
  }

  public async getTransactions(
    customerId: string,
    params: GetTransactionsParams = {},
  ): Promise<components['schemas']['TransactionsResponse']> {
    return this.get<components['schemas']['TransactionsResponse']>(
      this.customerPath(customerId, '/transactions'),
      params,
    );
  }

  public async getGoals(
    customerId: string,
  ): Promise<components['schemas']['GoalsResponse']> {
    return this.get<components['schemas']['GoalsResponse']>(
      this.customerPath(customerId, '/goals'),
    );
  }

  public async getFilters(
    customerId: string,
  ): Promise<components['schemas']['FilterMetadataResponse']> {
    return this.get<components['schemas']['FilterMetadataResponse']>(
      this.customerPath(customerId, '/filters'),
    );
  }
}

export const customerSpendingFacade = new CustomerSpendingFacade();
