import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JavaperfAnalyzesSettingComponent } from './javaperf-analyzes-setting.component';

describe('JavaperfAnalyzesSettingComponent', () => {
  let component: JavaperfAnalyzesSettingComponent;
  let fixture: ComponentFixture<JavaperfAnalyzesSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JavaperfAnalyzesSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JavaperfAnalyzesSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
