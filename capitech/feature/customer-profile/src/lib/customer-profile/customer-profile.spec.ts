import { ComponentFixture, TestBed } from '@angular/core/testing';
import { customerSpendingFacade } from '@capitech/data-access';
import { CustomerProfile } from './customer-profile';

describe('CustomerProfile', () => {
  let component: CustomerProfile;
  let fixture: ComponentFixture<CustomerProfile>;

  const profile = {
    customerId: '12345',
    name: 'John Doe',
    email: 'john.doe@email.com',
    joinDate: '2023-01-15',
    accountType: 'premium',
    totalSpent: 15420.5,
    currency: 'ZAR',
  };

  beforeEach(async () => {
    localStorage.setItem('capitech-demo-customer-id', '12345');
    jest.spyOn(customerSpendingFacade, 'getCustomerProfile').mockResolvedValue(profile);

    await TestBed.configureTestingModule({
      imports: [CustomerProfile]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('capitech-demo-customer-id');
    jest.restoreAllMocks();
  });

  it('loads and displays the customer profile through the facade', () => {
    expect(component).toBeTruthy();
    expect(customerSpendingFacade.getCustomerProfile).toHaveBeenCalledWith('12345');
    expect(fixture.nativeElement.textContent).toContain('John Doe');
    expect(fixture.nativeElement.textContent).toContain('john.doe@email.com');
  });
});