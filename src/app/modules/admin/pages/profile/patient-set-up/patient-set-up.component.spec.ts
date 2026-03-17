import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSetUpComponent } from './patient-set-up.component';

describe('PatientSetUpComponent', () => {
  let component: PatientSetUpComponent;
  let fixture: ComponentFixture<PatientSetUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientSetUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientSetUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
