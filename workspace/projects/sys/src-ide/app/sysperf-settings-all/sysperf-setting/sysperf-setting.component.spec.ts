import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysperfSettingComponent } from './sysperf-setting.component';

describe('SysperfSettingComponent', () => {
  let component: SysperfSettingComponent;
  let fixture: ComponentFixture<SysperfSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysperfSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysperfSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
