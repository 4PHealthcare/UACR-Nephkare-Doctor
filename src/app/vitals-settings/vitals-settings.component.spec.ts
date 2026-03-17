import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalsSettingsComponent } from './vitals-settings.component';

describe('VitalsSettingsComponent', () => {
  let component: VitalsSettingsComponent;
  let fixture: ComponentFixture<VitalsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VitalsSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VitalsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
