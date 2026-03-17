import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecilitySectionComponent } from './specility-section.component';

describe('SpecilitySectionComponent', () => {
  let component: SpecilitySectionComponent;
  let fixture: ComponentFixture<SpecilitySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecilitySectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecilitySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
