import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionScheduleComponent } from './mission-schedule.component';

describe('MissionScheduleComponent', () => {
  let component: MissionScheduleComponent;
  let fixture: ComponentFixture<MissionScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
