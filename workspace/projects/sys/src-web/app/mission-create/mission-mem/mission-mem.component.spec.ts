import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionMemComponent } from './mission-mem.component';

describe('MissionMemComponent', () => {
  let component: MissionMemComponent;
  let fixture: ComponentFixture<MissionMemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionMemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionMemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
