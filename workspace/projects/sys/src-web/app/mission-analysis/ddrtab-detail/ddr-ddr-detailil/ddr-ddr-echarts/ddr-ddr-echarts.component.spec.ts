import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DdrDdrEchartsComponent } from './ddr-ddr-echarts.component';

describe('DdrDdrEchartsComponent', () => {
  let component: DdrDdrEchartsComponent;
  let fixture: ComponentFixture<DdrDdrEchartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DdrDdrEchartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DdrDdrEchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
