import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IoapisComponent } from './ioapis.component';

describe('IoapisComponent', () => {
  let component: IoapisComponent;
  let fixture: ComponentFixture<IoapisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IoapisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IoapisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
