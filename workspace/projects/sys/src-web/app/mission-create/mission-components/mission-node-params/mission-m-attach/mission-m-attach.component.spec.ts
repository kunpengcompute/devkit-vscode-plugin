import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionMAttachComponent } from './mission-m-attach.component';

describe('MissionMAttachComponent', () => {
  let component: MissionMAttachComponent;
  let fixture: ComponentFixture<MissionMAttachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionMAttachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionMAttachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
