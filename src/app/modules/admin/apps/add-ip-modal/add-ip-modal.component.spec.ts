import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIpModalComponent } from './add-ip-modal.component';

describe('AddIpModalComponent', () => {
  let component: AddIpModalComponent;
  let fixture: ComponentFixture<AddIpModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddIpModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddIpModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
