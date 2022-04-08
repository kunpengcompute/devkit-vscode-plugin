import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileHttpComponent } from './profile-http.component';

describe('ProfileHttpComponent', () => {
  let component: ProfileHttpComponent;
  let fixture: ComponentFixture<ProfileHttpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileHttpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileHttpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
