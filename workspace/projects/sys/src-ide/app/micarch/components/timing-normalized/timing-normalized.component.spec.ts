import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimingNormalizedComponent } from './timing-normalized.component';

describe('TimingNormalizedComponent', () => {
  let component: TimingNormalizedComponent;
  let fixture: ComponentFixture<TimingNormalizedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimingNormalizedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimingNormalizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
