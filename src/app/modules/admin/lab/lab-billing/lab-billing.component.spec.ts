import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabBillingComponent } from './lab-billing.component';

describe('LabBillingComponent', () => {
  let component: LabBillingComponent;
  let fixture: ComponentFixture<LabBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBillingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
