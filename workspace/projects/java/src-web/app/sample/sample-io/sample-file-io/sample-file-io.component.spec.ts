import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleFileIoComponent } from './sample-file-io.component';

describe('SampleFileIoComponent', () => {
  let component: SampleFileIoComponent;
  let fixture: ComponentFixture<SampleFileIoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleFileIoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleFileIoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
