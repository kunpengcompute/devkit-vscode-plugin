import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistogramTreeComponent } from './histogram-tree.component';

describe('HistogramTreeComponent', () => {
  let component: HistogramTreeComponent;
  let fixture: ComponentFixture<HistogramTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistogramTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistogramTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
