import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondOpinionDetailsComponent } from './second-opinion-details.component';

describe('SecondOpinionDetailsComponent', () => {
  let component: SecondOpinionDetailsComponent;
  let fixture: ComponentFixture<SecondOpinionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecondOpinionDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondOpinionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
