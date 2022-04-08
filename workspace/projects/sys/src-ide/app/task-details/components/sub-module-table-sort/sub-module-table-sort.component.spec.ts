import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubModuleTableSortComponent } from './sub-module-table-sort.component';

describe('SubModuleTableSortComponent', () => {
  let component: SubModuleTableSortComponent;
  let fixture: ComponentFixture<SubModuleTableSortComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubModuleTableSortComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubModuleTableSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
