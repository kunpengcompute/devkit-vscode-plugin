import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysSummaryComponent } from './sys-summary.component';

describe('SysSummaryComponent', () => {
  let component: SysSummaryComponent;
  let fixture: ComponentFixture<SysSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
