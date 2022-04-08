import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEchartComponent } from './profile-echart.component';

describe('ProfileEchartComponent', () => {
  let component: ProfileEchartComponent;
  let fixture: ComponentFixture<ProfileEchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileEchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileEchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
