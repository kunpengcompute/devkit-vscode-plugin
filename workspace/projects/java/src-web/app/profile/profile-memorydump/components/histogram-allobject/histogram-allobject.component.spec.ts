import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistogramAllobjectComponent } from './histogram-allobject.component';

describe('HistogramAllobjectComponent', () => {
  let component: HistogramAllobjectComponent;
  let fixture: ComponentFixture<HistogramAllobjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistogramAllobjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistogramAllobjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
