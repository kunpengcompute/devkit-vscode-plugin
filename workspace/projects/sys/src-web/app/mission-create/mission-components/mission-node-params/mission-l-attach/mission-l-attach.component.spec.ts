import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionLAttachComponent } from './mission-l-attach.component';

describe('MissionLAttachComponent', () => {
  let component: MissionLAttachComponent;
  let fixture: ComponentFixture<MissionLAttachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionLAttachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionLAttachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
