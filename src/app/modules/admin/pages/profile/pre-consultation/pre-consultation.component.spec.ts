import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreConsultationComponent } from './pre-consultation.component';

describe('PreConsultationComponent', () => {
  let component: PreConsultationComponent;
  let fixture: ComponentFixture<PreConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreConsultationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
