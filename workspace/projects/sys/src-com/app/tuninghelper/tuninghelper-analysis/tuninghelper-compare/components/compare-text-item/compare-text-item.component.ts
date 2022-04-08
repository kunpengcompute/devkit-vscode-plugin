import { Component, Input, OnInit } from '@angular/core';

export type CompareItem = {
  different: boolean;
  label: string;
  tip?: string;
  value: string | string[];
};

@Component({
  selector: 'app-compare-text-item',
  templateUrl: './compare-text-item.component.html',
  styleUrls: ['./compare-text-item.component.scss']
})
export class CompareTextItemComponent implements OnInit {

  @Input() item: CompareItem;
  @Input() labelWidth: string;

  constructor() { }

  ngOnInit(): void {
  }

  public isArray(value: any) {
    return Array.isArray(value);
  }

}
