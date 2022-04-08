import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageResourceConfigComponent } from './storage-resource-config.component';

describe('StorageResourceConfigComponent', () => {
  let component: StorageResourceConfigComponent;
  let fixture: ComponentFixture<StorageResourceConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorageResourceConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageResourceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
