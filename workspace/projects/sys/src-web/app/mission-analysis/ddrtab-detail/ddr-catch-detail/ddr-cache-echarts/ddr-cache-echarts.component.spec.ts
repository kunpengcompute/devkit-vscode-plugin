import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DdrCacheEchartsComponent } from './ddr-cache-echarts.component';

describe('DdrCacheEchartsComponent', () => {
  let component: DdrCacheEchartsComponent;
  let fixture: ComponentFixture<DdrCacheEchartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DdrCacheEchartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DdrCacheEchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
