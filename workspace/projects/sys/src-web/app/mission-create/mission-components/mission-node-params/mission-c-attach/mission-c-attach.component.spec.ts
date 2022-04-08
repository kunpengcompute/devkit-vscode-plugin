import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionCAttachComponent } from './mission-c-attach.component';

describe('MissionCAttachComponent', () => {
  let component: MissionCAttachComponent;
  let fixture: ComponentFixture<MissionCAttachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionCAttachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionCAttachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
