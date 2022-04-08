import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionRProfileComponent } from './mission-r-profile.component';

describe('MissionRProfileComponent', () => {
  let component: MissionRProfileComponent;
  let fixture: ComponentFixture<MissionRProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionRProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionRProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
