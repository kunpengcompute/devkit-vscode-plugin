import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaidLevelComponent } from './raid-level.component';

describe('RaidLevelComponent', () => {
  let component: RaidLevelComponent;
  let fixture: ComponentFixture<RaidLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaidLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaidLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
