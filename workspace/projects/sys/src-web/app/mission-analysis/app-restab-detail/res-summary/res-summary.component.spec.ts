import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResSummaryComponent } from './res-summary.component';

describe('ResSummuryComponent', () => {
  let component: ResSummaryComponent;
  let fixture: ComponentFixture<ResSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
