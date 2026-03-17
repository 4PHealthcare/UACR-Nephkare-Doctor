import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertOpinionReportComponent } from './expert-opinion-report.component';

describe('ExpertOpinionReportComponent', () => {
  let component: ExpertOpinionReportComponent;
  let fixture: ComponentFixture<ExpertOpinionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpertOpinionReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpertOpinionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
