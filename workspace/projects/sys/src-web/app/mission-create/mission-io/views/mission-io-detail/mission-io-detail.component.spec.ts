import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionIoDetailComponent } from './mission-io-detail.component';

describe('MissionIoDetailComponent', () => {
  let component: MissionIoDetailComponent;
  let fixture: ComponentFixture<MissionIoDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionIoDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionIoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
