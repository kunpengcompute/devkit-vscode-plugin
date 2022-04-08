import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionDetailCopyComponent } from './function-detail-copy.component';

describe('FunctionDetailCopyComponent', () => {
  let component: FunctionDetailCopyComponent;
  let fixture: ComponentFixture<FunctionDetailCopyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionDetailCopyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionDetailCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
