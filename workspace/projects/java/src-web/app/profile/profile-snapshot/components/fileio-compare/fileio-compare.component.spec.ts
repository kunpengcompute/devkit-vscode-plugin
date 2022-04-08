import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileioCompareComponent } from './fileio-compare.component';

describe('FileioCompareComponent', () => {
  let component: FileioCompareComponent;
  let fixture: ComponentFixture<FileioCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileioCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileioCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
