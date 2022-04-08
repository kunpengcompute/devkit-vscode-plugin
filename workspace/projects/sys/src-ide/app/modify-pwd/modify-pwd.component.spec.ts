import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyPwdComponent } from './modify-pwd.component';

describe('ModifyPwdComponent', () => {
  let component: ModifyPwdComponent;
  let fixture: ComponentFixture<ModifyPwdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyPwdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyPwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
