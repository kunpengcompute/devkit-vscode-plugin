import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContrastSnapshotComponent } from './contrast-snapshot.component';

describe('ContrastSnapshotComponent', () => {
  let component: ContrastSnapshotComponent;
  let fixture: ComponentFixture<ContrastSnapshotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContrastSnapshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContrastSnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
