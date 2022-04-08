import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionDProfileComponent } from './mission-d-profile.component';

describe('MissionDProfileComponent', () => {
  let component: MissionDProfileComponent;
  let fixture: ComponentFixture<MissionDProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissionDProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionDProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
