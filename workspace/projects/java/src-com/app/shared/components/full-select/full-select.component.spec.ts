import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullSelectComponent } from './full-select.component';

describe('FullSelectComponent', () => {
  let component: FullSelectComponent;
  let fixture: ComponentFixture<FullSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
