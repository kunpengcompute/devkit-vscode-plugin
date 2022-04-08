import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionMLaunchComponent } from './mission-m-launch.component';

describe('MissionMLaunchComponent', () => {
  let component: MissionMLaunchComponent;
  let fixture: ComponentFixture<MissionMLaunchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionMLaunchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionMLaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
