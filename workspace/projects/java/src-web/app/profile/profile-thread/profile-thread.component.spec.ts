import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileThreadComponent } from './profile-thread.component';

describe('ProfileThreadComponent', () => {
  let component: ProfileThreadComponent;
  let fixture: ComponentFixture<ProfileThreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileThreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
