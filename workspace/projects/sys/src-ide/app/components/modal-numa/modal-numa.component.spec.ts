import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNumaComponent } from './modal-numa.component';

describe('ModalNumaComponent', () => {
  let component: ModalNumaComponent;
  let fixture: ComponentFixture<ModalNumaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalNumaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNumaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
