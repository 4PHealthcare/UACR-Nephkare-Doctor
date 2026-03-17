import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCustomerSupportComponent } from './view-customer-support.component';

describe('ViewCustomerSupportComponent', () => {
  let component: ViewCustomerSupportComponent;
  let fixture: ComponentFixture<ViewCustomerSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewCustomerSupportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCustomerSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
