import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalizeBlockChartComponent } from './normalize-block-chart.component';

describe('NormalizeBlockChartComponent', () => {
  let component: NormalizeBlockChartComponent;
  let fixture: ComponentFixture<NormalizeBlockChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NormalizeBlockChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalizeBlockChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
