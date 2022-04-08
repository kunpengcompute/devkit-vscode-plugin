import { Component, ElementRef, Input, OnInit, ViewChild, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { TiDragService, TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit, AfterViewInit {
  @Input() isSuggest: boolean;
  @ViewChild('draggable', { static: true }) private draggableEle: ElementRef;
  @Output() private closeHandle = new EventEmitter();
  @Input() suggestArr: Array<any>;
  @Input() type: number;
  public hoverClose: string;
  public i18n: any;
  public configPoolSrcData: TiTableSrcData;
  public configPoolColumns: Array<TiTableColumns> = [];
  public configPoolDisplayed: Array<TiTableRowData> = [];
  constructor(
    private dragService: TiDragService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.configPoolColumns = [
      {
        title: 'key',
        width: '50%'
      },
      {
        title: 'value',
        width: '50%'
      }
    ];
    this.configPoolSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.suggestArr.forEach(el => {
      el.sugHeight = false;
    });
  }
  public onHoverClose(msg?: any) {
    this.hoverClose = msg;
  }

  ngAfterViewInit(): void {
    this.dragService.create({
      helper: this.draggableEle.nativeElement
    });
  }
  public closeSuggest() {
    this.hoverClose = '';
    this.isSuggest = false;
    this.closeHandle.emit(true);
  }
  public changeHeight(idx: any) {
    this.suggestArr[idx].sugHeight = !this.suggestArr[idx].sugHeight;
  }
}
