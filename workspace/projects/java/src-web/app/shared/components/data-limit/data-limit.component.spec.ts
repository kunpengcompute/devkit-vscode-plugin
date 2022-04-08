import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLimitComponent } from './data-limit.component';

describe('DataLimitComponent', () => {
  let component: DataLimitComponent;
  let fixture: ComponentFixture<DataLimitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataLimitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
