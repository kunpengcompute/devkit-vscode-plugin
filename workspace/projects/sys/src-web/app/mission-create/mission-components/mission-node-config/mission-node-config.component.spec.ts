import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionNodeConfigComponent } from './mission-node-config.component';

describe('MissionNodeConfigComponent', () => {
  let component: MissionNodeConfigComponent;
  let fixture: ComponentFixture<MissionNodeConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionNodeConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionNodeConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
