import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionCLaunchComponent } from './mission-c-launch.component';

describe('MissionCLaunchComponent', () => {
  let component: MissionCLaunchComponent;
  let fixture: ComponentFixture<MissionCLaunchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionCLaunchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionCLaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
