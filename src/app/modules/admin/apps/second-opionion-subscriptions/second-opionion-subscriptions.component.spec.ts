import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondOpinionSubscriptionComponent } from './second-opionion-subscriptions.component';

describe('RequestListComponent', () => {
  let component: SecondOpinionSubscriptionComponent;
  let fixture: ComponentFixture<SecondOpinionSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecondOpinionSubscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondOpinionSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
