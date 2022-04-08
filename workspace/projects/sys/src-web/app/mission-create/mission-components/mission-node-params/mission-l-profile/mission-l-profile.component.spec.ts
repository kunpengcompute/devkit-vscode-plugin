import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionLProfileComponent } from './mission-l-profile.component';

describe('MissionLProfileComponent', () => {
  let component: MissionLProfileComponent;
  let fixture: ComponentFixture<MissionLProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionLProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionLProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
