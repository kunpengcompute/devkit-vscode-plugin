import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunStackNodeComponent } from './fun-stack-node.component';

describe('FunStackNodeComponent', () => {
  let component: FunStackNodeComponent;
  let fixture: ComponentFixture<FunStackNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FunStackNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FunStackNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
