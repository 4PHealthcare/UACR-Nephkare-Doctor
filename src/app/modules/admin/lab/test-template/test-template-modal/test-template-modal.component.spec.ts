import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestTemplateModalComponent } from './test-template-modal.component';

describe('TestTemplateModalComponent', () => {
  let component: TestTemplateModalComponent;
  let fixture: ComponentFixture<TestTemplateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestTemplateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestTemplateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
