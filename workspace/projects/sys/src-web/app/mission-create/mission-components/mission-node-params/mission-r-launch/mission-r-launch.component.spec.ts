import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionRLaunchComponent } from './mission-r-launch.component';

describe('MissionRLaunchComponent', () => {
  let component: MissionRLaunchComponent;
  let fixture: ComponentFixture<MissionRLaunchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionRLaunchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionRLaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
