import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionIoNodeConfigComponent } from './mission-io-node-config.component';

describe('MissionIoNodeConfigComponent', () => {
  let component: MissionIoNodeConfigComponent;
  let fixture: ComponentFixture<MissionIoNodeConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionIoNodeConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionIoNodeConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
