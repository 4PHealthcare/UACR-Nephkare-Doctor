import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAnalysisComponent } from './report-analysis.component';

describe('ReportAnalysisComponent', () => {
  let component: ReportAnalysisComponent;
  let fixture: ComponentFixture<ReportAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
