import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationModalComponent } from './medication-modal.component';

describe('MedicationModalComponent', () => {
  let component: MedicationModalComponent;
  let fixture: ComponentFixture<MedicationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
