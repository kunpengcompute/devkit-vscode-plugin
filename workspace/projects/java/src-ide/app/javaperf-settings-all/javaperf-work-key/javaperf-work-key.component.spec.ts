import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JavaperfWorkKeyComponent } from './javaperf-work-key.component';

describe('JavaperfWorkKeyComponent', () => {
  let component: JavaperfWorkKeyComponent;
  let fixture: ComponentFixture<JavaperfWorkKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JavaperfWorkKeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JavaperfWorkKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
