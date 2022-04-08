import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CassandraCompareComponent } from './cassandra-compare.component';

describe('CassandraCompareComponent', () => {
  let component: CassandraCompareComponent;
  let fixture: ComponentFixture<CassandraCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CassandraCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CassandraCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
