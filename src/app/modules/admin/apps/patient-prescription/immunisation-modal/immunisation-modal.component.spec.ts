import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmunisationModalComponent } from './immunisation-modal.component';

describe('ChiefComplaintModalComponent', () => {
  let component: ImmunisationModalComponent;
  let fixture: ComponentFixture<ImmunisationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImmunisationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImmunisationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
