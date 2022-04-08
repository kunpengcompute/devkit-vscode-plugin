import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionSlidingComponent } from './mission-sliding.component';

describe('MissionSlidingComponent', () => {
  let component: MissionSlidingComponent;
  let fixture: ComponentFixture<MissionSlidingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissionSlidingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionSlidingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
