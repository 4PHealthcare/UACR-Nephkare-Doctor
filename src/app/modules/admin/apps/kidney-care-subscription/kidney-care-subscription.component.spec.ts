import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KidneyCareSubscriptionComponent } from './kidney-care-subscription.component';

describe('RequestListComponent', () => {
  let component: KidneyCareSubscriptionComponent;
  let fixture: ComponentFixture<KidneyCareSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KidneyCareSubscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KidneyCareSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
