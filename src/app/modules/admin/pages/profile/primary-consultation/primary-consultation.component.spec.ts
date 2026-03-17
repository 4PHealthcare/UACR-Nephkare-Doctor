import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryConsultationComponent } from './primary-consultation.component';

describe('PrimaryConsultationComponent', () => {
  let component: PrimaryConsultationComponent;
  let fixture: ComponentFixture<PrimaryConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrimaryConsultationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrimaryConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
