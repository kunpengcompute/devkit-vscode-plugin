import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeapdumpReportComponent } from './heapdump-report.component';

describe('HeapdumpReportComponent', () => {
  let component: HeapdumpReportComponent;
  let fixture: ComponentFixture<HeapdumpReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeapdumpReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeapdumpReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
