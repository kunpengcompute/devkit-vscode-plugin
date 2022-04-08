import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysSettingItemSelectComponent } from './sys-setting-item-select.component';

describe('SysSettingItemSelectComponent', () => {
  let component: SysSettingItemSelectComponent;
  let fixture: ComponentFixture<SysSettingItemSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysSettingItemSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysSettingItemSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
