import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonReportDetailComponent } from './common-report-detail.component';

describe('CommonReportDetailComponent', () => {
  let component: CommonReportDetailComponent;
  let fixture: ComponentFixture<CommonReportDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonReportDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonReportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
