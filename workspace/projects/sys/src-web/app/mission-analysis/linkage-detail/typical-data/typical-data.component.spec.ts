import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypicalDataComponent } from './typical-data.component';

describe('TypicalDataComponent', () => {
  let component: TypicalDataComponent;
  let fixture: ComponentFixture<TypicalDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypicalDataComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypicalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
