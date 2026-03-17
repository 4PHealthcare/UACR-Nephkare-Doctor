import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVitalNotesComponent } from './add-vital-notes.component';

describe('TreatmentComponent', () => {
  let component: AddVitalNotesComponent;
  let fixture: ComponentFixture<AddVitalNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddVitalNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVitalNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
