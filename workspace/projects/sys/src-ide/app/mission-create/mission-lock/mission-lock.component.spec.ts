import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionLockComponent } from './mission-lock.component';

describe('MissionLockComponent', () => {
  let component: MissionLockComponent;
  let fixture: ComponentFixture<MissionLockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionLockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
