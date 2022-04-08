import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleThreadComponent } from './sample-thread.component';

describe('SampleThreadComponent', () => {
  let component: SampleThreadComponent;
  let fixture: ComponentFixture<SampleThreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleThreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
