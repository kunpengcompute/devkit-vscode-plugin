import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionIoScheduleModifyComponent } from './mission-io-schedule-modify.component';

describe('MissionIoScheduleModifyComponent', () => {
  let component: MissionIoScheduleModifyComponent;
  let fixture: ComponentFixture<MissionIoScheduleModifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionIoScheduleModifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionIoScheduleModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
