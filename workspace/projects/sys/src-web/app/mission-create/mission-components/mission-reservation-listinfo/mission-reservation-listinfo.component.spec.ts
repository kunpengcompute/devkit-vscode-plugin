import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionReservationListinfoComponent } from './mission-reservation-listinfo.component';

describe('MissionReservationListinfoComponent', () => {
  let component: MissionReservationListinfoComponent;
  let fixture: ComponentFixture<MissionReservationListinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionReservationListinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionReservationListinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
