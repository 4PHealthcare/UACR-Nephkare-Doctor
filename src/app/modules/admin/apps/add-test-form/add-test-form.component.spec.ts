import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTestFormComponent } from './add-test-form.component';

describe('AddTestFormComponent', () => {
  let component: AddTestFormComponent;
  let fixture: ComponentFixture<AddTestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTestFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
