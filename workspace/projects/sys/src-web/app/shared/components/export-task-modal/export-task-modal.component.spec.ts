import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportTaskModalComponent } from './export-task-modal.component';

describe('ExportTaskModalComponent', () => {
  let component: ExportTaskModalComponent;
  let fixture: ComponentFixture<ExportTaskModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportTaskModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
