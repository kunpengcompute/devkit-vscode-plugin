import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HpcMpiComComponent } from './hpc-mpi-com.component';

describe('HpcMpiComComponent', () => {
  let component: HpcMpiComComponent;
  let fixture: ComponentFixture<HpcMpiComComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HpcMpiComComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HpcMpiComComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
