import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionCProfileComponent } from './mission-c-profile.component';

describe('MissionCProfileComponent', () => {
  let component: MissionCProfileComponent;
  let fixture: ComponentFixture<MissionCProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionCProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionCProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
