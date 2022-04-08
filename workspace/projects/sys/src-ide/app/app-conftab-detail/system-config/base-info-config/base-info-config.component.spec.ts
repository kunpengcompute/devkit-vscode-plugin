import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseInfoConfigComponent } from './base-info-config.component';

describe('BaseInfoConfigComponent', () => {
  let component: BaseInfoConfigComponent;
  let fixture: ComponentFixture<BaseInfoConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseInfoConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseInfoConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
