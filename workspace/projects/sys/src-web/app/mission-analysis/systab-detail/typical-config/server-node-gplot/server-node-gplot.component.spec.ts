import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerNodeGplotComponent } from './server-node-gplot.component';

describe('ServerNodeGplotComponent', () => {
  let component: ServerNodeGplotComponent;
  let fixture: ComponentFixture<ServerNodeGplotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerNodeGplotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerNodeGplotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
