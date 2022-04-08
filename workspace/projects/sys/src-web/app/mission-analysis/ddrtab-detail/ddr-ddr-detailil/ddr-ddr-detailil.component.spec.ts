import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DdrDdrDetaililComponent } from './ddr-ddr-detailil.component';

describe('DdrDdrDetaililComponent', () => {
  let component: DdrDdrDetaililComponent;
  let fixture: ComponentFixture<DdrDdrDetaililComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DdrDdrDetaililComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DdrDdrDetaililComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
