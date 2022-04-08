import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JdbcpoolComponent } from './jdbcpool.component';

describe('JdbcpoolComponent', () => {
  let component: JdbcpoolComponent;
  let fixture: ComponentFixture<JdbcpoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JdbcpoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JdbcpoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
