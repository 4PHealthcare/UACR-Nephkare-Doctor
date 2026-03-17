import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonForCancelComponent } from './reason-for-cancel.component';

describe('ReasonForCancelComponent', () => {
  let component: ReasonForCancelComponent;
  let fixture: ComponentFixture<ReasonForCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReasonForCancelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReasonForCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
