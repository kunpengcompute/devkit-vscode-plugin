import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RamConfigComponent } from './ram-config.component';

describe('RamConfigComponent', () => {
  let component: RamConfigComponent;
  let fixture: ComponentFixture<RamConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RamConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RamConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
