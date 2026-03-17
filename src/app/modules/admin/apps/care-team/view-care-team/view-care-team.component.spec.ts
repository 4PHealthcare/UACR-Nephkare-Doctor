import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCareTeamComponent } from './view-care-team.component';

describe('ViewCareTeamComponent', () => {
  let component: ViewCareTeamComponent;
  let fixture: ComponentFixture<ViewCareTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewCareTeamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCareTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
