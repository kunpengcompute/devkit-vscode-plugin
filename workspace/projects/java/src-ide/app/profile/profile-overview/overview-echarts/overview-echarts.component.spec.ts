import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewEchartsComponent } from './overview-echarts.component';

describe('OverviewEchartsComponent', () => {
  let component: OverviewEchartsComponent;
  let fixture: ComponentFixture<OverviewEchartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewEchartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewEchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
