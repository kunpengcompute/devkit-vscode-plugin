import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleObjectsComponent } from './sample-objects.component';

describe('SampleObjectsComponent', () => {
  let component: SampleObjectsComponent;
  let fixture: ComponentFixture<SampleObjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleObjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
