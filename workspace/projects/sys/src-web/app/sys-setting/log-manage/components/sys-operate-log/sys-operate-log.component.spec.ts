import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysOperateLogComponent } from './sys-operate-log.component';

describe('SysOperateLogComponent', () => {
  let component: SysOperateLogComponent;
  let fixture: ComponentFixture<SysOperateLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysOperateLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysOperateLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
