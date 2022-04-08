import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileJDBCComponent } from './profile-jdbc.component';

describe('ProfileJDBCComponent', () => {
  let component: ProfileJDBCComponent;
  let fixture: ComponentFixture<ProfileJDBCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileJDBCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileJDBCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
