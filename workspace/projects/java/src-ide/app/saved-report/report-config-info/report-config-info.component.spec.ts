import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportConfigInfoComponent } from './report-config-info.component';

describe('ReportConfigInfoComponent', () => {
  let component: ReportConfigInfoComponent;
  let fixture: ComponentFixture<ReportConfigInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportConfigInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportConfigInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
