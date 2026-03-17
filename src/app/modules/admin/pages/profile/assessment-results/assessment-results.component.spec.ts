import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentResultsComponent } from './assessment-results.component';

describe('FollowUpComponent', () => {
  let component: AssessmentResultsComponent;
  let fixture: ComponentFixture<AssessmentResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
