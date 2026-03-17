import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientQueriesComponent } from './patient-queries.component';

describe('PatientQueriesComponent', () => {
  let component: PatientQueriesComponent;
  let fixture: ComponentFixture<PatientQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientQueriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
