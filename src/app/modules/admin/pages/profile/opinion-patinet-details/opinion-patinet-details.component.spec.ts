import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpinionPatinetDetailsComponent } from './opinion-patinet-details.component';

describe('OpinionPatinetDetailsComponent', () => {
  let component: OpinionPatinetDetailsComponent;
  let fixture: ComponentFixture<OpinionPatinetDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpinionPatinetDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpinionPatinetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
