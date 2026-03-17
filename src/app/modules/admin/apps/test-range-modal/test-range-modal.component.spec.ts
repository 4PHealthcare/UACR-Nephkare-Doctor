import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestRangeModalComponent } from './test-range-modal.component';

describe('TestRangeModalComponent', () => {
  let component: TestRangeModalComponent;
  let fixture: ComponentFixture<TestRangeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestRangeModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRangeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
