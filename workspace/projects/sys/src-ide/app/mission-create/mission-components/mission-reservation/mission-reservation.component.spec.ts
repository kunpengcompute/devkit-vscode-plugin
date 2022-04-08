import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionReservationComponent } from './mission-reservation.component';

describe('MissionReservationComponent', () => {
  let component: MissionReservationComponent;
  let fixture: ComponentFixture<MissionReservationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionReservationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
