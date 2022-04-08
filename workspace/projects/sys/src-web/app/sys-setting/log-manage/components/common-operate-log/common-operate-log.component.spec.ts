import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonOperateLogComponent } from './common-operate-log.component';

describe('CommonOperateLogComponent', () => {
  let component: CommonOperateLogComponent;
  let fixture: ComponentFixture<CommonOperateLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonOperateLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonOperateLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
