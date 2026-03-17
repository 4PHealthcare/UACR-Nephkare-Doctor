import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentIllnessComponent } from './present-illness.component';

describe('PresentIllnessComponent', () => {
  let component: PresentIllnessComponent;
  let fixture: ComponentFixture<PresentIllnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresentIllnessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresentIllnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
