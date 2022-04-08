import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSnapshotComponent } from './profile-snapshot.component';

describe('ProfileSnapshotComponent', () => {
  let component: ProfileSnapshotComponent;
  let fixture: ComponentFixture<ProfileSnapshotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileSnapshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
