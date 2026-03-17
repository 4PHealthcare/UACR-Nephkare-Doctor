import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestListModalComponent } from './test-list-modal.component';

describe('TestListModalComponent', () => {
  let component: TestListModalComponent;
  let fixture: ComponentFixture<TestListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestListModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
