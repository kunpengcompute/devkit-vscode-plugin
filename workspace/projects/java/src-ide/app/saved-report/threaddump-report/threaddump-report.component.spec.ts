import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreaddumpReportComponent } from './threaddump-report.component';

describe('ThreaddumpReportComponent', () => {
  let component: ThreaddumpReportComponent;
  let fixture: ComponentFixture<ThreaddumpReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreaddumpReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreaddumpReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
