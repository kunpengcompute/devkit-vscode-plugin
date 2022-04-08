import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JDBCComponent } from './jdbc.component';

describe('JDBCComponent', () => {
  let component: JDBCComponent;
  let fixture: ComponentFixture<JDBCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JDBCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JDBCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
