import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SleepLogsComponent } from './sleep-logs.component';

describe('SleepLogsComponent', () => {
  let component: SleepLogsComponent;
  let fixture: ComponentFixture<SleepLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SleepLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SleepLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
