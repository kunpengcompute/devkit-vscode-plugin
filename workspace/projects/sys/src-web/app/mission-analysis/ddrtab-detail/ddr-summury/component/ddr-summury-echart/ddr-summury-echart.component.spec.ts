import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DdrSummuryEchartComponent } from './ddr-summury-echart.component';

describe('DdrSummuryEchartComponent', () => {
  let component: DdrSummuryEchartComponent;
  let fixture: ComponentFixture<DdrSummuryEchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DdrSummuryEchartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DdrSummuryEchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
