import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleLockComponent } from './sample-lock.component';

describe('SampleLockComponent', () => {
  let component: SampleLockComponent;
  let fixture: ComponentFixture<SampleLockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleLockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
