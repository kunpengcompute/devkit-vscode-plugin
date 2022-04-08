import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMemorydumpComponent } from './profile-memorydump.component';

describe('ProfileMemorydumpComponent', () => {
  let component: ProfileMemorydumpComponent;
  let fixture: ComponentFixture<ProfileMemorydumpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileMemorydumpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileMemorydumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
