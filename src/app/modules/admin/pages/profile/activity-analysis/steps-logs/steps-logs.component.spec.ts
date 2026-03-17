import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsLogsComponent } from './steps-logs.component';

describe('StepsLogsComponent', () => {
  let component: StepsLogsComponent;
  let fixture: ComponentFixture<StepsLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepsLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepsLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
