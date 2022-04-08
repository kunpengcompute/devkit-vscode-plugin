import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionLLaunchComponent } from './mission-l-launch.component';

describe('MissionLLaunchComponent', () => {
  let component: MissionLLaunchComponent;
  let fixture: ComponentFixture<MissionLLaunchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionLLaunchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionLLaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
