import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysperfApplicationPathComponent } from './sysperf-application-path.component';

describe('SysperfApplicationPathComponent', () => {
  let component: SysperfApplicationPathComponent;
  let fixture: ComponentFixture<SysperfApplicationPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysperfApplicationPathComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysperfApplicationPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
