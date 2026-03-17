import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribedPatientComponent } from './subscribed-patient.component';

describe('TreatmentComponent', () => {
  let component: SubscribedPatientComponent;
  let fixture: ComponentFixture<SubscribedPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscribedPatientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscribedPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
