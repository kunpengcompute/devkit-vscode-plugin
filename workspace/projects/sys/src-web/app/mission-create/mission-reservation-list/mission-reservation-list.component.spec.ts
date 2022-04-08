import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionReservationListComponent } from './mission-reservation-list.component';

describe('MissionReservationListComponent', () => {
  let component: MissionReservationListComponent;
  let fixture: ComponentFixture<MissionReservationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionReservationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionReservationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
