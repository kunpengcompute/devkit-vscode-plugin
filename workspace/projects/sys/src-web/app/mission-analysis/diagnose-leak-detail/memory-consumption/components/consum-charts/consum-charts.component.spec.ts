import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumChartsComponent } from './consum-charts.component';

describe('ConsumChartsComponent', () => {
  let component: ConsumChartsComponent;
  let fixture: ComponentFixture<ConsumChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
