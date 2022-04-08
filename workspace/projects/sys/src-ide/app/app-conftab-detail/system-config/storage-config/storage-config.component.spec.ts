import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageConfigComponent } from './storage-config.component';

describe('StorageConfigComponent', () => {
  let component: StorageConfigComponent;
  let fixture: ComponentFixture<StorageConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorageConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
