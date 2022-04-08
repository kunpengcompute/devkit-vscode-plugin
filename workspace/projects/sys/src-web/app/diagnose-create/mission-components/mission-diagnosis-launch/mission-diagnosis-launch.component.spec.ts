import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionDiagnosisLaunchComponent } from './mission-diagnosis-launch.component';

describe('MissionDiagnosisLaunchComponent', () => {
  let component: MissionDiagnosisLaunchComponent;
  let fixture: ComponentFixture<MissionDiagnosisLaunchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissionDiagnosisLaunchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionDiagnosisLaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
