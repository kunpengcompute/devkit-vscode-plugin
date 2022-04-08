import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlameComponent } from './flame.component';

describe('FlameComponent', () => {
  let component: FlameComponent;
  let fixture: ComponentFixture<FlameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
