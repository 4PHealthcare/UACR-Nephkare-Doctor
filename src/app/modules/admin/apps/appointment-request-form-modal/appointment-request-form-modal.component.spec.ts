import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentRequestFormModalComponent } from './appointment-request-form-modal.component';

describe('AppointmentRequestFormModalComponent', () => {
  let component: AppointmentRequestFormModalComponent;
  let fixture: ComponentFixture<AppointmentRequestFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentRequestFormModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentRequestFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
