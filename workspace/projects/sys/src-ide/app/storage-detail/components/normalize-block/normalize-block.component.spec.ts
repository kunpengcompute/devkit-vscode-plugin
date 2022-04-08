import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalizeBlockComponent } from './normalize-block.component';

describe('NormalizeBlockComponent', () => {
  let component: NormalizeBlockComponent;
  let fixture: ComponentFixture<NormalizeBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NormalizeBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalizeBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
