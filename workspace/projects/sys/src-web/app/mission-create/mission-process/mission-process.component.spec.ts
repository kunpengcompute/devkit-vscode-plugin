import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionProcessComponent } from './mission-process.component';

describe('MissionProcessComponent', () => {
  let component: MissionProcessComponent;
  let fixture: ComponentFixture<MissionProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
