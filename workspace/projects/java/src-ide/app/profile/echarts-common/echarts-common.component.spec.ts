import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EchartsCommonComponent } from './echarts-common.component';

describe('EchartsCommonComponent', () => {
  let component: EchartsCommonComponent;
  let fixture: ComponentFixture<EchartsCommonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EchartsCommonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EchartsCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
