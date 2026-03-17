import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminationsComponent } from './examinations.component';

describe('ExaminationsComponent', () => {
  let component: ExaminationsComponent;
  let fixture: ComponentFixture<ExaminationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExaminationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExaminationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
