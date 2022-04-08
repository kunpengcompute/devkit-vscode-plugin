import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackTipComponent } from './stack-tip.component';

describe('StackTipComponent', () => {
  let component: StackTipComponent;
  let fixture: ComponentFixture<StackTipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackTipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
