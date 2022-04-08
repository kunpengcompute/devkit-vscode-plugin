import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorCheckboxComponent } from './color-checkbox.component';

describe('ColorCheckboxComponent', () => {
  let component: ColorCheckboxComponent;
  let fixture: ComponentFixture<ColorCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
