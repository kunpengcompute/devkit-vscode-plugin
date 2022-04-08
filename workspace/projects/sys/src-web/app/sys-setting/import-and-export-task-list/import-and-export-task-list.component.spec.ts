import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAndExportTaskListComponent } from './import-and-export-task-list.component';

describe('ImportAndExportTaskListComponent', () => {
  let component: ImportAndExportTaskListComponent;
  let fixture: ComponentFixture<ImportAndExportTaskListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportAndExportTaskListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAndExportTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
