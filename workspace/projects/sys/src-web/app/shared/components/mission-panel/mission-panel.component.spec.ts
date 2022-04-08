import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionPanelComponent } from './mission-panel.component';

describe('MissionPanelComponent', () => {
  let component: MissionPanelComponent;
  let fixture: ComponentFixture<MissionPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
