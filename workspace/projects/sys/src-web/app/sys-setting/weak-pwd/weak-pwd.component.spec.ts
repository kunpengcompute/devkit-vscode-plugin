import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeakPwdComponent } from './weak-pwd.component';

describe('WeakPwdComponent', () => {
  let component: WeakPwdComponent;
  let fixture: ComponentFixture<WeakPwdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeakPwdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeakPwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
