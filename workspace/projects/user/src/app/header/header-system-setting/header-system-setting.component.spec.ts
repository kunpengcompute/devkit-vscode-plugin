import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSystemSettingComponent } from './header-system-setting.component';

describe('HeaderSystemSettingComponent', () => {
  let component: HeaderSystemSettingComponent;
  let fixture: ComponentFixture<HeaderSystemSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderSystemSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderSystemSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
