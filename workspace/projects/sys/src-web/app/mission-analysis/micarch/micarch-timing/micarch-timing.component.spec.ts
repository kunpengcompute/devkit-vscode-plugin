import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MicarchTimingComponent } from './micarch-timing.component';

describe('MicarchTimingComponent', () => {
  let component: MicarchTimingComponent;
  let fixture: ComponentFixture<MicarchTimingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MicarchTimingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicarchTimingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
