import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTaskModalComponent } from './import-task-modal.component';

describe('ImportTaskModalComponent', () => {
  let component: ImportTaskModalComponent;
  let fixture: ComponentFixture<ImportTaskModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportTaskModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
