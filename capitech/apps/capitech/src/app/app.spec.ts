import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { customerSpendingFacade } from '@capitech/data-access';

import { App } from './app';

describe('App', () => {
  beforeEach(() => {
    localStorage.setItem('capitech-demo-customer-id', '12345');
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

  it('hides and shows the navigation menu when toggled', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const shell = fixture.nativeElement.querySelector('.app-shell') as HTMLElement;
    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;

    expect(toggle.getAttribute('aria-label')).toBe('Hide menu');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    fixture.detectChanges();
    expect(shell.classList).toContain('sidebar-hidden');
    expect(toggle.getAttribute('aria-label')).toBe('Show menu');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    fixture.detectChanges();
    expect(shell.classList).not.toContain('sidebar-hidden');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  afterEach(() => {
    localStorage.removeItem('capitech-demo-customer-id');
    jest.restoreAllMocks();
  });
});
