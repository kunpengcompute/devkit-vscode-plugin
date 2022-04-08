import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimingSummuryComponent } from './timing-summury.component';

describe('TimingSummuryComponent', () => {
  let component: TimingSummuryComponent;
  let fixture: ComponentFixture<TimingSummuryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimingSummuryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimingSummuryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
