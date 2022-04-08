import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageSummuryComponent } from './storage-summury.component';

describe('StorageSummuryComponent', () => {
  let component: StorageSummuryComponent;
  let fixture: ComponentFixture<StorageSummuryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorageSummuryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageSummuryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
