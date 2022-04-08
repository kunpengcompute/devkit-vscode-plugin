import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DdrtabDetailComponent } from './ddrtab-detail.component';

describe('DdrtabDetailComponent', () => {
  let component: DdrtabDetailComponent;
  let fixture: ComponentFixture<DdrtabDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DdrtabDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DdrtabDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
