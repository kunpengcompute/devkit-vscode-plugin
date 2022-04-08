import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkKeyComponent } from './work-key.component';

describe('WorkKeyComponent', () => {
  let component: WorkKeyComponent;
  let fixture: ComponentFixture<WorkKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkKeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
