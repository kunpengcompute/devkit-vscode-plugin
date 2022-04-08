import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineReportinforComponent } from './offline-reportinfor.component';

describe('OfflineReportinforComponent', () => {
  let component: OfflineReportinforComponent;
  let fixture: ComponentFixture<OfflineReportinforComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfflineReportinforComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineReportinforComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
