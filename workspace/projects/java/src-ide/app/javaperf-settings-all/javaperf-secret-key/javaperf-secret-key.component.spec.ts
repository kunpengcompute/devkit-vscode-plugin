import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JavaperfSecretKeyComponent } from './javaperf-secret-key.component';

describe('JavaperfSecretKeyComponent', () => {
  let component: JavaperfSecretKeyComponent;
  let fixture: ComponentFixture<JavaperfSecretKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JavaperfSecretKeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JavaperfSecretKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
