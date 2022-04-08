import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageSubsystemDataComponent } from './storage-subsystem-data.component';

describe('StorageSubsystemDataComponent', () => {
  let component: StorageSubsystemDataComponent;
  let fixture: ComponentFixture<StorageSubsystemDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorageSubsystemDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageSubsystemDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
