import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMemoryComponent } from './profile-memory.component';

describe('ProfileMemoryComponent', () => {
  let component: ProfileMemoryComponent;
  let fixture: ComponentFixture<ProfileMemoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileMemoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
