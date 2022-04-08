import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockSummuryComponent } from './lock-summury.component';

describe('LockSummuryComponent', () => {
  let component: LockSummuryComponent;
  let fixture: ComponentFixture<LockSummuryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockSummuryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockSummuryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
