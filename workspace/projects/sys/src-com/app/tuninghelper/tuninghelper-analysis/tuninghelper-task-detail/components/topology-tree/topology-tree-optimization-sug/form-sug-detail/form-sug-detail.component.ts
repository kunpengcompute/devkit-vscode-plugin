import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { RelavantFormItem } from '../../domain';

@Component({
  selector: 'app-form-sug-detail',
  templateUrl: './form-sug-detail.component.html',
  styleUrls: ['./form-sug-detail.component.scss']
})
export class FormSugDetailComponent implements OnInit, OnChanges {

  @Input() formList: Array<RelavantFormItem>;

  constructor() { }

  ngOnInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.formList && this.formList) {
      changes.formList.currentValue.forEach((item: any) => {
        if (item.name === 'PAGESIZE') {
          item.name = 'Page Size';
        }
      });
      this.formList = changes.formList.currentValue;
    }
  }

}
