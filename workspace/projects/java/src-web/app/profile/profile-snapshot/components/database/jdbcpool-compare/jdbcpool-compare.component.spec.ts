import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JdbcpoolCompareComponent } from './jdbcpool-compare.component';

describe('JdbcpoolCompareComponent', () => {
  let component: JdbcpoolCompareComponent;
  let fixture: ComponentFixture<JdbcpoolCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JdbcpoolCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JdbcpoolCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
