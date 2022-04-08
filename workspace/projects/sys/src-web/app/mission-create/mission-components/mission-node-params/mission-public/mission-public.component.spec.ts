import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionPublicComponent } from './mission-public.component';

describe('MissionPublicComponent', () => {
  let component: MissionPublicComponent;
  let fixture: ComponentFixture<MissionPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionPublicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
