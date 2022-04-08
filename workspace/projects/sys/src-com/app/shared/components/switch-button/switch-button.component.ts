import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-switch-button',
  templateUrl: './switch-button.component.html',
  styleUrls: ['./switch-button.component.scss']
})
export class SwitchButtonComponent implements OnInit {
  @Input() selectedNum: number;
  @Input() originTotal: number;
  @Output() selectClick = new EventEmitter<boolean>();
  constructor() { }
  public isSelected = false; // 表格展示数据方式
  ngOnInit(): void {
  }
  public buttonClick(bool: boolean) {
    this.isSelected = bool;
    this.selectClick.emit(bool);
  }
}
