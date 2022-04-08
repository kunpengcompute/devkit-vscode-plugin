import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GclogReportComponent } from './gclog-report.component';

describe('GclogReportComponent', () => {
  let component: GclogReportComponent;
  let fixture: ComponentFixture<GclogReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GclogReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GclogReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
