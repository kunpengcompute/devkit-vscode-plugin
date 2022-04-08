import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileHotComponent } from './profile-hot.component';

describe('ProfileHotComponent', () => {
  let component: ProfileHotComponent;
  let fixture: ComponentFixture<ProfileHotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileHotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileHotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
