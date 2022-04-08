import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MicarchComponent } from './micarch.component';

describe('MicarchComponent', () => {
  let component: MicarchComponent;
  let fixture: ComponentFixture<MicarchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MicarchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicarchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
