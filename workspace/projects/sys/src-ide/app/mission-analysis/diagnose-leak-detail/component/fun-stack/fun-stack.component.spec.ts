import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunStackComponent } from './fun-stack.component';

describe('FunStackComponent', () => {
  let component: FunStackComponent;
  let fixture: ComponentFixture<FunStackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FunStackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FunStackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
