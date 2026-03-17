import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRelativesComponent } from './view-relatives.component';

describe('ViewRelativesComponent', () => {
  let component: ViewRelativesComponent;
  let fixture: ComponentFixture<ViewRelativesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRelativesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRelativesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
