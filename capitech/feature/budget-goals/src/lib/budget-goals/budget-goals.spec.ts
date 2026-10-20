import { ComponentFixture, TestBed } from '@angular/core/testing';
import { customerSpendingFacade } from '@capitech/data-access';
import { BudgetGoals } from './budget-goals';

describe('BudgetGoals', () => {
  let component: BudgetGoals;
  let fixture: ComponentFixture<BudgetGoals>;

  const goals = {
    goals: [
      {
        id: 'goal_001', category: 'Entertainment', monthlyBudget: 1000,
        currentSpent: 650.3, percentageUsed: 65.03, daysRemaining: 12, status: 'on_track' as const,
      },
      {
        id: 'goal_002', category: 'Groceries', monthlyBudget: 1500,
        currentSpent: 1450.8, percentageUsed: 96.72, daysRemaining: 12, status: 'warning' as const,
      },
    ],
  };

  beforeEach(async () => {
    localStorage.setItem('capitech-demo-customer-id', '12345');
    jest.spyOn(customerSpendingFacade, 'getGoals').mockResolvedValue(goals);

    await TestBed.configureTestingModule({
      imports: [BudgetGoals]
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetGoals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads goal budgets and calculates the aggregate budget summary', () => {
    expect(customerSpendingFacade.getGoals).toHaveBeenCalledWith('12345');
    expect(component.totalBudget()).toBe(2500);
    expect(component.totalSpent()).toBeCloseTo(2101.1);
    expect(fixture.nativeElement.textContent).toContain('Entertainment');
    expect(fixture.nativeElement.textContent).toContain('Groceries');
  });

  afterEach(() => {
    localStorage.removeItem('capitech-demo-customer-id');
    jest.restoreAllMocks();
  });
});
