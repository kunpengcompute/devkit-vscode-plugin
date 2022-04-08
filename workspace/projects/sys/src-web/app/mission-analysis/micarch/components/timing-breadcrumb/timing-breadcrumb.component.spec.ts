import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimingBreadcrumbComponent } from './timing-breadcrumb.component';

describe('TimingBreadcrumbComponent', () => {
  let component: TimingBreadcrumbComponent;
  let fixture: ComponentFixture<TimingBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimingBreadcrumbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimingBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
