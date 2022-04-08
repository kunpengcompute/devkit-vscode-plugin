import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSearchBoxComponent } from './table-search-box.component';

describe('TableSearchBoxComponent', () => {
  let component: TableSearchBoxComponent;
  let fixture: ComponentFixture<TableSearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableSearchBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
