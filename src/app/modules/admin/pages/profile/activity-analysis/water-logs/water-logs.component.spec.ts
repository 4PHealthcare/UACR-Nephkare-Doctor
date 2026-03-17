import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterLogsComponent } from './water-logs.component';

describe('WaterLogsComponent', () => {
  let component: WaterLogsComponent;
  let fixture: ComponentFixture<WaterLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaterLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
