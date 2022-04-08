import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionSLaunchComponent } from './mission-s-launch.component';

describe('MissionSLaunchComponent', () => {
  let component: MissionSLaunchComponent;
  let fixture: ComponentFixture<MissionSLaunchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionSLaunchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionSLaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
