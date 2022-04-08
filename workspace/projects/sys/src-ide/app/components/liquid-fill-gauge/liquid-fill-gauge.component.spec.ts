import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidFillGaugeComponent } from './liquid-fill-gauge.component';

describe('LiquidFillGaugeComponent', () => {
  let component: LiquidFillGaugeComponent;
  let fixture: ComponentFixture<LiquidFillGaugeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidFillGaugeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidFillGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
