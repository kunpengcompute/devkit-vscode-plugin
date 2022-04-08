import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysDiskComponent } from './sys-disk.component';

describe('SysDiskComponent', () => {
  let component: SysDiskComponent;
  let fixture: ComponentFixture<SysDiskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysDiskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysDiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
