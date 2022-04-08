import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionModalHeaderComponent } from './mission-modal-header.component';

describe('MissionModalHeaderComponent', () => {
  let component: MissionModalHeaderComponent;
  let fixture: ComponentFixture<MissionModalHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionModalHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionModalHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
