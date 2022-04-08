import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubModuleFunctionComponent } from './sub-module-function.component';

describe('SubModuleFunctionComponent', () => {
  let component: SubModuleFunctionComponent;
  let fixture: ComponentFixture<SubModuleFunctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubModuleFunctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubModuleFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
