import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleStorageComponent } from './sample-storage.component';

describe('SampleStorageComponent', () => {
  let component: SampleStorageComponent;
  let fixture: ComponentFixture<SampleStorageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
