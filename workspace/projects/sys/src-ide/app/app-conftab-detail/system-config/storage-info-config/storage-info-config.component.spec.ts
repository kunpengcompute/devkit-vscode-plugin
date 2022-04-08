import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageInfoConfigComponent } from './storage-info-config.component';

describe('StorageInfoConfigComponent', () => {
  let component: StorageInfoConfigComponent;
  let fixture: ComponentFixture<StorageInfoConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorageInfoConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageInfoConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
