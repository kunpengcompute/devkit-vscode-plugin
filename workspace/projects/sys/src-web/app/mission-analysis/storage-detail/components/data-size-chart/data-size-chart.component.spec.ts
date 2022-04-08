import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSizeChartComponent } from './data-size-chart.component';

describe('DataSizeChartComponent', () => {
  let component: DataSizeChartComponent;
  let fixture: ComponentFixture<DataSizeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataSizeChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSizeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
