import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionIoComponent } from './mission-io.component';

describe('MissionIoComponent', () => {
  let component: MissionIoComponent;
  let fixture: ComponentFixture<MissionIoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionIoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionIoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
