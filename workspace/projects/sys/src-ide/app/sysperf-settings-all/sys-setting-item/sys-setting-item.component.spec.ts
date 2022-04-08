import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysSettingItemComponent } from './sys-setting-item.component';

describe('SysSettingItemComponent', () => {
  let component: SysSettingItemComponent;
  let fixture: ComponentFixture<SysSettingItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysSettingItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysSettingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
