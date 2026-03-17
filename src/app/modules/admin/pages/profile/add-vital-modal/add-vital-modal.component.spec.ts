import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVitalModalComponent } from './add-vital-modal.component';

describe('ChiefComplaintModalComponent', () => {
  let component: AddVitalModalComponent;
  let fixture: ComponentFixture<AddVitalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddVitalModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVitalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
