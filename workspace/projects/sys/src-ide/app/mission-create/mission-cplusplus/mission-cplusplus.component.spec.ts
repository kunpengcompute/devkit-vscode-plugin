import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionCplusplusComponent } from './mission-cplusplus.component';

describe('MissionCplusplusComponent', () => {
  let component: MissionCplusplusComponent;
  let fixture: ComponentFixture<MissionCplusplusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionCplusplusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionCplusplusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
