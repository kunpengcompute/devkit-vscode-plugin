import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-optimize-sug-cell',
  templateUrl: './optimize-sug-cell.component.html',
  styleUrls: ['./optimize-sug-cell.component.scss']
})
export class OptimizeSugCellComponent implements OnInit {

  // 优化建议源数据
  @Input() sugData: any;
  // 改变选择状态
  @Output() changeSelecedState = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * 组件点击事件-改变选择状态
   */
  public clickSugCell() {
    this.changeSelecedState.emit(this.sugData);
  }

}
