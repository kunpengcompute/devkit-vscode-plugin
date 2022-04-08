import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageSubsystemComponent } from './storage-subsystem.component';

describe('StorageSubsystemComponent', () => {
  let component: StorageSubsystemComponent;
  let fixture: ComponentFixture<StorageSubsystemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorageSubsystemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageSubsystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
