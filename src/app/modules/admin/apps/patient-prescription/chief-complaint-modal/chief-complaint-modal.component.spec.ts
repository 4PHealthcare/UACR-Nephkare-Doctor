import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChiefComplaintModalComponent } from './chief-complaint-modal.component';

describe('ChiefComplaintModalComponent', () => {
  let component: ChiefComplaintModalComponent;
  let fixture: ComponentFixture<ChiefComplaintModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChiefComplaintModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChiefComplaintModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
