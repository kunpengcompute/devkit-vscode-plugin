import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { TableService } from 'sys/src-com/app/service/table.service';
import { IHpcTopDwon } from '../../../domain';
import { HpcTopDownService } from '../../service';
import { ContentScrollDirective } from 'sys/src-web/app/shared/directives/contentScroll/content-scroll.directive';

@Component({
  selector: 'app-hpc-top-down',
  templateUrl: './hpc-top-down.component.html',
  styleUrls: ['./hpc-top-down.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HpcTopDownComponent implements OnInit {

  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskId: number;
  @Input() nodeId: number;
  public isIE = false;

  public i18n: any;
  public isTable = false;
  public displayed: Array<TiTableRowData>;
  public srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  public columns: Array<TiTableColumns>;
  public levelIndex = 0;
  public topDownData: Array<IHpcTopDwon> = [];
  public echartsData: IHpcTopDwon;
  public isLoading = false;
  public onIcicleHeightChange: any = 600;
  constructor(
    private i18nService: I18nService,
    private tableService: TableService,
    private topDownService: HpcTopDownService,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
  ) {
    this.i18n = this.i18nService.I18n();

    this.columns = [
      { title: this.i18n.hpc.hpc_target.event_name, width: '50%' },
      { title: this.i18n.hpc.hpc_target.event_rate, width: '50%' }
    ];
  }

  ngOnInit(): void {
    if ('ActiveXObject' in window) {
      this.isIE = true;
    }
    this.topDownService.getTopDownData(this.taskId, this.nodeId)
      .then(({ topdown, echartsData }) => {
        this.topDownData = topdown;
        this.srcData.data = topdown;
        this.echartsData = echartsData;
        this.isLoading = false;
        this.cdr.markForCheck();
      }).catch(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    this.isTable = false;
  }

  toggle(node: IHpcTopDwon) {
    node.expand = !node.expand;
    this.srcData.data = this.tableService.getTreeTableArr(this.topDownData);
    this.cdr.markForCheck();
  }
  public changeHeight(msg: any) {
    this.onIcicleHeightChange = msg;
    const svgDom = this.el.nativeElement.querySelector('#echartsSvg');
    svgDom.style.height = `${msg}px`;
  }
}
