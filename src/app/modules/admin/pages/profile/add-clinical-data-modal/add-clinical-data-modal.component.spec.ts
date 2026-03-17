import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClinicalDataModalComponent } from './add-clinical-data-modal.component';

describe('AddClinicalDataModalComponent', () => {
  let component: AddClinicalDataModalComponent;
  let fixture: ComponentFixture<AddClinicalDataModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddClinicalDataModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClinicalDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
