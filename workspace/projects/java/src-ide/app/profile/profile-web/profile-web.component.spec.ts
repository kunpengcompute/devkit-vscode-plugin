import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileWebComponent } from './profile-web.component';

describe('ProfileWebComponent', () => {
  let component: ProfileWebComponent;
  let fixture: ComponentFixture<ProfileWebComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileWebComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
