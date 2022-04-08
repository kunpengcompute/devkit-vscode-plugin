// 子模块-有个下拉框、表格可下转、点击跳转至汇编代码模块
import {
  Component, OnInit, Output, EventEmitter,
  Input, ViewChild, ElementRef
} from '@angular/core';
import { TiTableRowData } from '@cloud/tiny3';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';

@Component({
  selector: 'app-sub-module-function',
  templateUrl: './sub-module-function.component.html',
  styleUrls: ['./sub-module-function.component.scss']
})
export class SubModuleFunctionComponent implements OnInit {
  @ViewChild('nodeDetailTd', { static: false }) nodeDetailTdEl: ElementRef;

  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;

  @Input() optionList: any;
  @Input() columns: any;
  @Input() theads: any;
  @Input() srcData: any;
  @Input() sortList: any;
  @Input() currentPage: any;
  @Input() totalNumber: any;
  @Input() pageSize: any;
  @Input() addPercentSignFields: any = [];
  @Input() isLoading: boolean;

  @Output() selectChange = new EventEmitter();
  @Output() getChildren = new EventEmitter();
  @Output() getTableData = new EventEmitter();
  @Output() expandColumn = new EventEmitter();
  @Output() sortTableData = new EventEmitter();
  @Output() addFunctionTab = new EventEmitter();

  @ViewChild('table1', { static: true }) table1: any;

  isFunctionTab = false;
  public i18n: any;

  public selectOption: any;

  public noDataInfo = '';
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）

  // 详情展开
  closeOtherDetails = false;
  detailColspan = 0;

  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService
  ) {
    this.i18n = this.i18nService.I18n();
    this.noDataInfo = this.i18n.common_term_task_nodata;
  }

  ngOnInit(): void {
    this.expandColumn.subscribe(() => {
      setTimeout(() => {
        const relyTheads: { colspan: number }[] = this.theads[0];
        this.detailColspan = relyTheads.reduce((sum, next) => {
          return sum + next.colspan;
        }, 0);
      });
    });
  }

  // 父组件调用 init【父组件的值都是调接口返回的，过早调用会报错】
  public init({ closeOtherDetails }: any) {
    this.selectOption = this.optionList.find((item: any) => item.checked) || this.optionList[0];
    this.doSelectOption(this.selectOption);
    this.closeOtherDetails = closeOtherDetails || false;
  }



  // 下拉框事件
  public doSelectOption(e: any) {
    this.currentPage = 1;
    this.selectChange.emit({ option: e });
  }

  // 获取子数据
  public toggle(node: any) {
    this.getChildren.emit({ node });
    this.expandColumn.next();
  }

  // 展开表格详情
  public beforeToggle(row: TiTableRowData): void {
    this.getChildren.emit({ node: row });
  }

  // 表格排序
  public sortTable(prop: any, order: any) {
    this.sortTableData.emit({ prop, order });
  }
}
