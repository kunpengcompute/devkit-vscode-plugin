import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtrapositionAxisOperationComponent } from './extraposition-axis-operation.component';

describe('ExtrapositionAxisOperationComponent', () => {
  let component: ExtrapositionAxisOperationComponent;
  let fixture: ComponentFixture<ExtrapositionAxisOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtrapositionAxisOperationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtrapositionAxisOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
