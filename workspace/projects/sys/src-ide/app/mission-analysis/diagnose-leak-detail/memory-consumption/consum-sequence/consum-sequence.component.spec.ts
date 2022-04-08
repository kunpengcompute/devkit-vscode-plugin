import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumSequenceComponent } from './consum-sequence.component';

describe('ConsumSequenceComponent', () => {
  let component: ConsumSequenceComponent;
  let fixture: ComponentFixture<ConsumSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumSequenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
