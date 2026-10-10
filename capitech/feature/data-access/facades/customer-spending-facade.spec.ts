import type { AxiosInstance } from 'axios';

import { CustomerSpendingFacade } from './customer-spending.facade';

describe('CustomerSpendingFacade', () => {
  let client: jest.Mocked<Pick<AxiosInstance, 'get'>>;
  let facade: CustomerSpendingFacade;

  beforeEach(() => {
    client = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Pick<AxiosInstance, 'get'>>;
    facade = new CustomerSpendingFacade(client as unknown as AxiosInstance);
  });

  it('loads the customer profile from the expected endpoint', async () => {
    const response = {
      customerId: '12345',
      name: 'John Doe',
      email: 'john.doe@email.com',
      joinDate: '2023-01-15',
      accountType: 'premium',
      totalSpent: 15420.5,
      currency: 'ZAR',
    };

    client.get.mockResolvedValueOnce({ data: response });

    await expect(facade.getCustomerProfile('12345')).resolves.toEqual(response);
    expect(client.get).toHaveBeenCalledWith('/customers/12345/profile', {
      params: undefined,
    });
  });

  it('sends the spending summary query params to the summary endpoint', async () => {
    const response = {
      period: '30d',
      totalSpent: 4250.75,
      transactionCount: 47,
      averageTransaction: 90.44,
      topCategory: 'Groceries',
    };

    client.get.mockResolvedValueOnce({ data: response });

    await expect(
      facade.getSpendingSummary('12345', { period: '30d' }),
    ).resolves.toEqual(response);

    expect(client.get).toHaveBeenCalledWith('/customers/12345/spending/summary', {
      params: { period: '30d' },
    });
  });

  it('passes filters and pagination through when loading transactions', async () => {
    const response = {
      transactions: [],
      pagination: {
        total: 0,
        limit: 20,
        offset: 0,
        hasMore: false,
      },
    };

    client.get.mockResolvedValueOnce({ data: response });

    await expect(
      facade.getTransactions('12345', {
        limit: 20,
        offset: 0,
        category: 'Groceries',
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        sortBy: 'amount_desc',
      }),
    ).resolves.toEqual(response);

    expect(client.get).toHaveBeenCalledWith('/customers/12345/transactions', {
      params: {
        limit: 20,
        offset: 0,
        category: 'Groceries',
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        sortBy: 'amount_desc',
      },
    });
  });
});
