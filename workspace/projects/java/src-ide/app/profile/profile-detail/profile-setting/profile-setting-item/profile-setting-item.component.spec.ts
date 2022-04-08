import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSettingItemComponent } from './profile-setting-item.component';

describe('ProfileSettingItemComponent', () => {
  let component: ProfileSettingItemComponent;
  let fixture: ComponentFixture<ProfileSettingItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileSettingItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSettingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
