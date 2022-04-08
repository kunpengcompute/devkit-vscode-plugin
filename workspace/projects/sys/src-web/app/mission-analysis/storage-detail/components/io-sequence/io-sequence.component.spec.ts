import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IoSequenceComponent } from './io-sequence.component';

describe('IoSequenceComponent', () => {
  let component: IoSequenceComponent;
  let fixture: ComponentFixture<IoSequenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IoSequenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IoSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
