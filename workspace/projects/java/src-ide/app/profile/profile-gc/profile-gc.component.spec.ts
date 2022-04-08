import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileGcComponent } from './profile-gc.component';

describe('ProfileGcComponent', () => {
  let component: ProfileGcComponent;
  let fixture: ComponentFixture<ProfileGcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileGcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileGcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
