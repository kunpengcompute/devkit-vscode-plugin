import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableProcessComponent } from './table-process.component';

describe('TableProcessComponent', () => {
  let component: TableProcessComponent;
  let fixture: ComponentFixture<TableProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
