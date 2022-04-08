import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileHeapdumpSavedComponent } from './profile-heapdump-saved.component';

describe('ProfileHeapdumpSavedComponent', () => {
  let component: ProfileHeapdumpSavedComponent;
  let fixture: ComponentFixture<ProfileHeapdumpSavedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileHeapdumpSavedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileHeapdumpSavedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
