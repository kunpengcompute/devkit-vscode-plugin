import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadTaskModalComponent } from './download-task-modal.component';

describe('DownloadTaskModalComponent', () => {
  let component: DownloadTaskModalComponent;
  let fixture: ComponentFixture<DownloadTaskModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadTaskModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
