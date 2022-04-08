import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitItemComponent } from './limit-item.component';

describe('LimitItemComponent', () => {
  let component: LimitItemComponent;
  let fixture: ComponentFixture<LimitItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LimitItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LimitItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
