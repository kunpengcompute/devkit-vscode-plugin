import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionSProfileComponent } from './mission-s-profile.component';

describe('MissionSProfileComponent', () => {
  let component: MissionSProfileComponent;
  let fixture: ComponentFixture<MissionSProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionSProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionSProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
