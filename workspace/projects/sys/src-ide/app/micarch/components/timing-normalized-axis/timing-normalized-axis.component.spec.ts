import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimingNormalizedAxisComponent } from './timing-normalized-axis.component';

describe('TimingNormalizedAxisComponent', () => {
  let component: TimingNormalizedAxisComponent;
  let fixture: ComponentFixture<TimingNormalizedAxisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimingNormalizedAxisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimingNormalizedAxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
