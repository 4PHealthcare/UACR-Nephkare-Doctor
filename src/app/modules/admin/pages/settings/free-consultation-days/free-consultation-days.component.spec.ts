import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeConsultationDaysComponent } from './free-consultation-days.component';

describe('FreeConsultationDaysComponent', () => {
  let component: FreeConsultationDaysComponent;
  let fixture: ComponentFixture<FreeConsultationDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreeConsultationDaysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeConsultationDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
