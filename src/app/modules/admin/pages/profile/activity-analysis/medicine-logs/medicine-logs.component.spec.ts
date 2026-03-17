import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineLogsComponent } from './medicine-logs.component';

describe('MedicineLogsComponent', () => {
  let component: MedicineLogsComponent;
  let fixture: ComponentFixture<MedicineLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicineLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicineLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
