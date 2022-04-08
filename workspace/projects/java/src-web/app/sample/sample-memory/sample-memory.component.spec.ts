import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleMemoryComponent } from './sample-memory.component';

describe('SampleMemoryComponent', () => {
  let component: SampleMemoryComponent;
  let fixture: ComponentFixture<SampleMemoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleMemoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
