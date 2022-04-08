import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissTimingComponent } from './miss-timing.component';

describe('MissTimingComponent', () => {
  let component: MissTimingComponent;
  let fixture: ComponentFixture<MissTimingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissTimingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissTimingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
