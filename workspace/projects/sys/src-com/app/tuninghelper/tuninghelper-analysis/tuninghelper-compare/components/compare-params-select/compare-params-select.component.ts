import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-compare-params-select',
  templateUrl: './compare-params-select.component.html',
  styleUrls: ['./compare-params-select.component.scss']
})
export class CompareParamsSelectComponent implements OnInit {

  public options: { label: string; value: 'diff' | 'all' }[] = [
    { label: I18n.tuninghelper.compare.diffParams, value: 'diff' },
    { label: I18n.tuninghelper.compare.allParams, value: 'all' },
  ];
  public selected = this.options[0];

  @Output() selectedChange = new EventEmitter<'diff' | 'all'>();

  constructor() { }

  ngOnInit(): void {
    this.selectedChange.emit(this.selected.value);
  }

  public onChange(selected: { label: string; value: 'diff' | 'all' }) {
    this.selectedChange.emit(selected.value);
  }

}
