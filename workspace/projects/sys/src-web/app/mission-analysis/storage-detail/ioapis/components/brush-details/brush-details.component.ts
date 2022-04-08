import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TiTableRowData } from '@cloud/tiny3';
import { FormBuilder } from '@angular/forms';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TableService } from 'sys/src-com/app/service/table.service';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';


@Component({
  selector: 'app-brush-details',
  templateUrl: './brush-details.component.html',
  styleUrls: ['./brush-details.component.scss']
})
export class BrushDetailsComponent implements OnInit {
  @Input() nodeid: string;
  @Input() taskid: any;
  @Input() readChecked: boolean;
  @Input() topState: string;
  @Input() timeTitle: string;
  @Output() public toggleTopOut = new EventEmitter<any>();

  constructor(
    public timessage: MessageModalService,
    public fb: FormBuilder,
    public Axios: AxiosService,
    public router: Router,
    public i18nService: I18nService,
    public tableService: TableService
  ) {
    this.i18n = this.i18nService.I18n();
    this.lang = sessionStorage.getItem('language');
    this.tlbData.columns = [
      { label: this.i18n.storageIO.ioapis.time, sortKey: 'time', compareType: 'number' },
      { label: this.i18n.storageIO.ioapis.cpid, sortKey: 'pid' },
      { label: this.i18n.mission_create.process_name, sortKey: 'cmd' },
      { label: this.i18n.storageIO.ioapis.params, sortKey: 'params' },
      { label: this.i18n.storageIO.ioapis.return, sortKey: 'return_val' },
      { label: this.i18n.storageIO.ioapis.task_time, sortKey: 'exec_time' },
    ];
  }
  public lang: any; // 语言,zh-cn: 中文, 'en-us': 英文
  public i18n: any;
  public pidFunction = 'Function/PID';
  public tlbData: any = {
    columns: [],
    displayed: ([] as Array<TiTableRowData>),
    srcData: {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
    pageNo: 0,
    total: (undefined as number),
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    },
  };
  public hoverArrow: any = '';
  ngOnInit() {
  }

  /**
   * 打开详情划框
   */
  public toggleTop(pid?: string, func?: string, startTime?: string, endTime?: string) {
    if (!func) { // 手动点击按钮
      this.topState === 'active'
        ? (this.topState = 'notActive')
        : (this.topState = 'active');
    } else {// 框选事件触发
      this.topState = 'active';
      this.pidFunction = func + '/' + pid;
      this.timeTitle = startTime + '-' + endTime;
      this.getBrushData(pid, func, startTime, endTime);
    }
    this.toggleTopOut.emit({
      topState: this.topState,
      timeTitle: this.timeTitle
    });
  }

  /**
   * 根据框选内容,请求详细信息
   */
  public getBrushData(pid?: string, func?: string, startTime?: string, endTime?: string) {
    const params = {
      nodeId: this.nodeid,
      pid,
      func,
      startTime,
      endTime,
    };
    this.Axios.axios.get(
      `/tasks/${encodeURIComponent(this.taskid)}/ioperformance/detail_io_api_org_data_by_time/`,
      { params }
    ).then((res: any) => {
      const data = res.data.io_api_org_data_by_time;
      if (data) {
        this.tlbData.srcData.data = data.data;
        this.tlbData.total = data.data.length;
      }
    });
  }
  public onHoverClose(msg?: any) {
    this.hoverArrow = msg;
  }
}
