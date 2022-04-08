import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallTreeComponent } from './call-tree.component';

describe('CallTreeComponent', () => {
  let component: CallTreeComponent;
  let fixture: ComponentFixture<CallTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
