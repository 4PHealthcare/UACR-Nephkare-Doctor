import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyNutritionDetailsComponent } from './daily-nutrition-details.component';

describe('DailyNutritionDetailsComponent', () => {
  let component: DailyNutritionDetailsComponent;
  let fixture: ComponentFixture<DailyNutritionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyNutritionDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyNutritionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
