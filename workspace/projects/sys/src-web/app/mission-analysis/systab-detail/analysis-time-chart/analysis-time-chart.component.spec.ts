import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisTimeChartComponent } from './analysis-time-chart.component';

describe('AnalysisTimeChartComponent', () => {
  let component: AnalysisTimeChartComponent;
  let fixture: ComponentFixture<AnalysisTimeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalysisTimeChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalysisTimeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
