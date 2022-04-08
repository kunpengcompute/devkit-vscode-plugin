import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemInfoComponent } from './mem-info.component';

describe('MemInfoComponent', () => {
  let component: MemInfoComponent;
  let fixture: ComponentFixture<MemInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
