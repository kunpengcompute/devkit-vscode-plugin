import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleSocketIoComponent } from './sample-socket-io.component';

describe('SampleSocketIoComponent', () => {
  let component: SampleSocketIoComponent;
  let fixture: ComponentFixture<SampleSocketIoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleSocketIoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleSocketIoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
