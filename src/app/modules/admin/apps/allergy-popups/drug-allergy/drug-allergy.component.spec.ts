import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugAllergyComponent } from './drug-allergy.component';

describe('DrugAllergyComponent', () => {
  let component: DrugAllergyComponent;
  let fixture: ComponentFixture<DrugAllergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrugAllergyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugAllergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
