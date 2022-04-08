import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionInfoComponent } from './function-info.component';

describe('FunctionInfoComponent', () => {
  let component: FunctionInfoComponent;
  let fixture: ComponentFixture<FunctionInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
