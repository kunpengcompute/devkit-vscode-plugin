import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsgSuggestionComponent } from './msg-suggestion.component';

describe('MsgSuggestionComponent', () => {
  let component: MsgSuggestionComponent;
  let fixture: ComponentFixture<MsgSuggestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsgSuggestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsgSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
