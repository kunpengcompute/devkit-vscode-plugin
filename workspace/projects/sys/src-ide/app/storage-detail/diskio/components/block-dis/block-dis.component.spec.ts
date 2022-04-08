import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockDisComponent } from './block-dis.component';

describe('BlockDisComponent', () => {
  let component: BlockDisComponent;
  let fixture: ComponentFixture<BlockDisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockDisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockDisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
