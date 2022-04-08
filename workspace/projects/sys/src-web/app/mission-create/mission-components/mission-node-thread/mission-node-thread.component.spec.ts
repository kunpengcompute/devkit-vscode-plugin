import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionNodeThreadComponent } from './mission-node-thread.component';

describe('MissionNodeThreadComponent', () => {
  let component: MissionNodeThreadComponent;
  let fixture: ComponentFixture<MissionNodeThreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionNodeThreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionNodeThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
