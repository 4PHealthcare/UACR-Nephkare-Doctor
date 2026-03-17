import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvironmentalAllergyComponent } from './environmental-allergy.component';

describe('EnvironmentalAllergyComponent', () => {
  let component: EnvironmentalAllergyComponent;
  let fixture: ComponentFixture<EnvironmentalAllergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnvironmentalAllergyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentalAllergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
