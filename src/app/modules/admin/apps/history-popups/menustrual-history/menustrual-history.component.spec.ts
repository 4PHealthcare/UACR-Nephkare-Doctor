import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenustrualHistoryComponent } from './menustrual-history.component';

describe('MenustrualHistoryComponent', () => {
  let component: MenustrualHistoryComponent;
  let fixture: ComponentFixture<MenustrualHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenustrualHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenustrualHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
