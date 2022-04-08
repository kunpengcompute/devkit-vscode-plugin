import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleLeakComponent } from './sample-leak.component';

describe('SampleLeakComponent', () => {
  let component: SampleLeakComponent;
  let fixture: ComponentFixture<SampleLeakComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleLeakComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleLeakComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
