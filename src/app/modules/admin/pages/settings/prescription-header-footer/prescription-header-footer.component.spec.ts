import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionHeaderFooterComponent } from './prescription-header-footer.component';

describe('PrescriptionHeaderFooterComponent', () => {
  let component: PrescriptionHeaderFooterComponent;
  let fixture: ComponentFixture<PrescriptionHeaderFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionHeaderFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionHeaderFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
