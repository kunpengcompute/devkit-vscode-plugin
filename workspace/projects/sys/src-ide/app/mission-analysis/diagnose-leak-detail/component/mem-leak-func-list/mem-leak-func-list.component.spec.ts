import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemLeakFuncListComponent } from './mem-leak-func-list.component';

describe('MemLeakFuncListComponent', () => {
  let component: MemLeakFuncListComponent;
  let fixture: ComponentFixture<MemLeakFuncListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemLeakFuncListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemLeakFuncListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
