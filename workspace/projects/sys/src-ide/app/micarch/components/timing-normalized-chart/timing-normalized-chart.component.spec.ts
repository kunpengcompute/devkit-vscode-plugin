import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimingNormalizedChartComponent } from './timing-normalized-chart.component';

describe('TimingNormalizedChartComponent', () => {
  let component: TimingNormalizedChartComponent;
  let fixture: ComponentFixture<TimingNormalizedChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimingNormalizedChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimingNormalizedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
