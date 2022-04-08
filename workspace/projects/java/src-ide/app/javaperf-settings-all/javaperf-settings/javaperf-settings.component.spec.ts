import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JavaperfSettingsComponent } from './javaperf-settings.component';

describe('JavaperfSettingsComponent', () => {
  let component: JavaperfSettingsComponent;
  let fixture: ComponentFixture<JavaperfSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JavaperfSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JavaperfSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
