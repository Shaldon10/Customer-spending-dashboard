import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { customerSpendingFacade } from '@capitech/data-access';

import { App } from './app';

describe('App', () => {
  beforeEach(() => {
    jest.spyOn(customerSpendingFacade, 'getCustomerProfile').mockResolvedValue({
      customerId: '12345',
      name: 'John Doe',
      email: 'john.doe@email.com',
      joinDate: '2023-01-15',
      accountType: 'premium',
      totalSpent: 15420.5,
      currency: 'ZAR',
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
