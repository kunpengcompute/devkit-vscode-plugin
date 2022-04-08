import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionHpcComponent } from './mission-hpc.component';

describe('MissionHpcComponent', () => {
  let component: MissionHpcComponent;
  let fixture: ComponentFixture<MissionHpcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionHpcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionHpcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
