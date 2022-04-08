import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypicalConfigComponent } from './typical-config.component';

describe('TypicalConfigComponent', () => {
  let component: TypicalConfigComponent;
  let fixture: ComponentFixture<TypicalConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypicalConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypicalConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
