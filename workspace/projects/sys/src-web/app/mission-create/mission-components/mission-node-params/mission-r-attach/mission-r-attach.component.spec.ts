import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionRAttachComponent } from './mission-r-attach.component';

describe('MissionRAttachComponent', () => {
  let component: MissionRAttachComponent;
  let fixture: ComponentFixture<MissionRAttachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionRAttachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionRAttachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
