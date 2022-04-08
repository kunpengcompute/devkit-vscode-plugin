import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionTemplatesAllComponent } from './mission-templates-all.component';

describe('MissionTemplatesAllComponent', () => {
  let component: MissionTemplatesAllComponent;
  let fixture: ComponentFixture<MissionTemplatesAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionTemplatesAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionTemplatesAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
