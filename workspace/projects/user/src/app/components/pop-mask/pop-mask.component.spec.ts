import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopMaskComponent } from './pop-mask.component';

describe('PopMaskComponent', () => {
  let component: PopMaskComponent;
  let fixture: ComponentFixture<PopMaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopMaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopMaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
