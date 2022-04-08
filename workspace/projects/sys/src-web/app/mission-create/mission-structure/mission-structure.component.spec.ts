import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionStructureComponent } from './mission-structure.component';

describe('MissionStructureComponent', () => {
  let component: MissionStructureComponent;
  let fixture: ComponentFixture<MissionStructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionStructureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
