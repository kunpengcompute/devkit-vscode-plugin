import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysSettingItemTextareaComponent } from './sys-setting-item-textarea.component';

describe('SysSettingItemTextareaComponent', () => {
  let component: SysSettingItemTextareaComponent;
  let fixture: ComponentFixture<SysSettingItemTextareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysSettingItemTextareaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysSettingItemTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
