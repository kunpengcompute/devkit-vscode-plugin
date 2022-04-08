import { Component, Output, Input, EventEmitter, } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-tag-box',
  templateUrl: './tag-box.component.html',
  styleUrls: ['./tag-box.component.scss']
})
export class TagBoxComponent{
  public isExpand = false; // tag是否展开
  public i18n: any;
  public isHover = false;
  public selected: Array<{disable: boolean}>;
  @Input() label: string;
  @Input()
  get selecTag() { return this.selected; }
  set selecTag(select) {
    this.isExpand = false;
    this.selected = select;
  }
  @Output() deleteTag = new EventEmitter();
  constructor(public i18nService: I18nService, ) {
    this.i18n = this.i18nService.I18n();
  }

  /**
   * 点击tag，删除选中项
   * @param taskItem taskItem
   */
  public deleteTask(taskItem: any) {
    this.deleteTag.emit(taskItem);
  }

  /**
   * 关闭tags弹框
   */
  public closeBox(){
    this.isExpand = false;
    this.isHover = false;
  }
}
