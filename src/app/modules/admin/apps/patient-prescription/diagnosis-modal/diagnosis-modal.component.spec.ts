import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisModalComponent } from './diagnosis-modal.component';

describe('DiagnosisModalComponent', () => {
  let component: DiagnosisModalComponent;
  let fixture: ComponentFixture<DiagnosisModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosisModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
