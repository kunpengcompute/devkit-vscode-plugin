import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionMProfileComponent } from './mission-m-profile.component';

describe('MissionMProfileComponent', () => {
  let component: MissionMProfileComponent;
  let fixture: ComponentFixture<MissionMProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionMProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionMProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
