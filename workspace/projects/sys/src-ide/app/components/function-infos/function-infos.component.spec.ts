import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionInfosComponent } from './function-infos.component';

describe('FunctionInfosComponent', () => {
  let component: FunctionInfosComponent;
  let fixture: ComponentFixture<FunctionInfosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionInfosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
