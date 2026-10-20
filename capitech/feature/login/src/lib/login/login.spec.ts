import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { customerSpendingFacade } from '@capitech/data-access';
import { AuthService } from './auth.service';
import { Login } from './login';

describe('Login', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
        {
          provide: Router,
          useValue: { navigateByUrl: jest.fn() },
        },
      ],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('uses the customer ID returned by authentication and navigates to the dashboard', async () => {
    jest.spyOn(customerSpendingFacade, 'authenticate').mockResolvedValue({ customerId: 'demo-900' });
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.username = 'admin';
    fixture.componentInstance.password = 'capitech123';

    await fixture.componentInstance.submit();

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getCustomerId()).toBe('demo-900');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows an error and does not authenticate with invalid credentials', async () => {
    jest.spyOn(customerSpendingFacade, 'authenticate').mockResolvedValue({ customerId: null });
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.username = 'admin';
    fixture.componentInstance.password = 'wrong';

    await fixture.componentInstance.submit();

    expect(auth.isAuthenticated()).toBe(false);
    expect(fixture.componentInstance.error()).toBe('Incorrect username or password.');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('reports API failures without creating a session', async () => {
    jest.spyOn(customerSpendingFacade, 'authenticate').mockRejectedValue(new Error('offline'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.username = 'admin';
    fixture.componentInstance.password = 'capitech123';

    await fixture.componentInstance.submit();

    expect(auth.isAuthenticated()).toBe(false);
    expect(fixture.componentInstance.error()).toContain('temporarily unavailable');
    expect(consoleError).toHaveBeenCalled();
  });

  afterEach(() => {
    localStorage.clear();
  });
});
