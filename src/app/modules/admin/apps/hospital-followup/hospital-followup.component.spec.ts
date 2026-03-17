import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalFollowupComponent } from './hospital-followup.component';

describe('HospitalFollowupComponent', () => {
  let component: HospitalFollowupComponent;
  let fixture: ComponentFixture<HospitalFollowupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalFollowupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HospitalFollowupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
