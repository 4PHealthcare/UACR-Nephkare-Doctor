import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentFormModalComponent } from './appointment-form-modal.component';

describe('AppointmentFormModalComponent', () => {
  let component: AppointmentFormModalComponent;
  let fixture: ComponentFixture<AppointmentFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentFormModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
