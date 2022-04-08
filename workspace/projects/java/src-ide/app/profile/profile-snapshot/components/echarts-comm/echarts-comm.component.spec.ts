import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EchartsCommComponent } from './echarts-comm.component';

describe('EchartsCommComponent', () => {
  let component: EchartsCommComponent;
  let fixture: ComponentFixture<EchartsCommComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EchartsCommComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EchartsCommComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
