import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLastPrescriptionMedicationComponent } from './view-last-prescription-medication.component';

describe('ViewLastPrescriptionMedicationComponent', () => {
  let component: ViewLastPrescriptionMedicationComponent;
  let fixture: ComponentFixture<ViewLastPrescriptionMedicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewLastPrescriptionMedicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLastPrescriptionMedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
