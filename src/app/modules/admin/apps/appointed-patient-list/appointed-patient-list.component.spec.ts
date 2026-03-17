import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointedPatientListComponent } from './appointed-patient-list.component';

describe('AppointedPatientListComponent', () => {
  let component: AppointedPatientListComponent;
  let fixture: ComponentFixture<AppointedPatientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointedPatientListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointedPatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
