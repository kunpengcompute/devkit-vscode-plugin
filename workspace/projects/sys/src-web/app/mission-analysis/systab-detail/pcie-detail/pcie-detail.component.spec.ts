import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcieDetailComponent } from './pcie-detail.component';

describe('PcieDetailComponent', () => {
  let component: PcieDetailComponent;
  let fixture: ComponentFixture<PcieDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PcieDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PcieDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
