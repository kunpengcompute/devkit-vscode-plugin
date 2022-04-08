import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionPerformanceComponent } from './mission-performance.component';

describe('MissionPerformanceComponent', () => {
  let component: MissionPerformanceComponent;
  let fixture: ComponentFixture<MissionPerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionPerformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
