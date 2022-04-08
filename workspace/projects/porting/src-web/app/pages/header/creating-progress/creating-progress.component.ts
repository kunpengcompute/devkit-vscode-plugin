import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../../service';

@Component({
  selector: 'app-creating-progress',
  templateUrl: './creating-progress.component.html',
  styleUrls: ['./creating-progress.component.scss']
})
export class CreatingProgressComponent implements OnInit, OnChanges {

  @Input() list: any;
  @Input() len: any;
  @Input() bottom: number;
  @Output() taskListChange = new EventEmitter();
  @Output() expandChange = new EventEmitter();
  public i18n: any;
  constructor(public i18nService: I18nService) { this.i18n = this.i18nService.I18n(); }

  public progressList: any = [];
  public isExpandList = true;
  ngOnInit() {
    this.getProgressList();
  }

  public getTaskMsg(msg: any) {
    if (msg.id) {
      const idx = this.list.findIndex((item: any) => {
        return item.id === msg.id;
      });
      if (idx >= 0) { this.list.splice(idx, 1); }
      this.taskListChange.emit(msg);
      this.getProgressList();
    }
  }

  private getProgressList() {
    this.progressList = this.list.slice();
  }

  public listToggle() {
    this.isExpandList = !this.isExpandList;
    this.expandChange.emit();
    this.getProgressList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getProgressList();
  }
}
