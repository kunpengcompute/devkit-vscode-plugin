import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionSAttachComponent } from './mission-s-attach.component';

describe('MissionSAttachComponent', () => {
  let component: MissionSAttachComponent;
  let fixture: ComponentFixture<MissionSAttachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionSAttachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionSAttachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
