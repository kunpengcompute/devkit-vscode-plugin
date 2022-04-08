import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaDownLoadComponent } from './ca-download.component';

describe('CadownloadComponent', () => {
  let component: CaDownLoadComponent;
  let fixture: ComponentFixture<CaDownLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaDownLoadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDownLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
