import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnoseTaskNodeConfigComponent } from './diagnose-task-node-config.component';

describe('DiagnoseTaskNodeConfigComponent', () => {
  let component: DiagnoseTaskNodeConfigComponent;
  let fixture: ComponentFixture<DiagnoseTaskNodeConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnoseTaskNodeConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnoseTaskNodeConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
