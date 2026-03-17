import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightLogsComponent } from './weight-logs.component';

describe('WeightLogsComponent', () => {
  let component: WeightLogsComponent;
  let fixture: ComponentFixture<WeightLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeightLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeightLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
