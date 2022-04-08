import { Component, OnInit } from '@angular/core';
import { TiModalService } from '@cloud/tiny3';
import { I18nService } from 'sys/src-com/app/service';
import { TableService } from 'sys/src-com/app/service/index';
import { TableData } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-task-detail/domain/index';

@Component({
  selector: 'app-pid-target',
  templateUrl: './pid-target.component.html',
  styleUrls: ['./pid-target.component.scss']
})
export class PidTargetComponent implements OnInit {
  public i18n: any;
  constructor(
    private tiModal: TiModalService,
    private i18nService: I18nService,
    public tableService: TableService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public hotFunStacksData: any;
  public stacksDisplayed: any = [{
    title: 'PID 11',
    expand: true,
    levelIndex: 0,
    children: [
      {
        title: 'phtyon',
        expand: false,
        child: [

        ]
      }
    ]
  },
  {
    title: 'PID 112',
    expand: false,
    levelIndex: 1,
    children: [
      {
        title: 'cache_miss',
        expand: false,
        child: [

        ]
      }
    ]
  },
  {
    title: 'PID 21',
    expand: true,
    levelIndex: 0,
    children: [
      {
        title: 'phtyon',
        expand: false,
        child: [

        ]
      }
    ]
  }];
  public hotFunction: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [{
        function: 'python',
        module: '1126',
        suggestion_url: []
      }],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
    pageNo: 1,
    total: 0,
    pageSize: {
      options: [10, 20, 50, 100],
      size: 10
    },
  };
  public operationFile: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
  };
  public operationNetport: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
  };
  public operationSys: TableData = {
    columns: [],
    displayed: [],
    srcData: {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    },
  };
  ngOnInit(): void {
    this.hotFunction.columns = [
      { label: this.i18n.storageIO.ioapis.functionName, key: 'time', },
      { label: '%CPU', key: '%CPU', sortKey: '%CPU' },
      { label: '%system', key: '%system', sortKey: '%system' },
      { label: '%user', key: '%user', sortKey: '%user' },
      { label: this.i18n.common_term_task_tab_summary_module, key: 'pid' },
      { label: 'Command', key: 'Command', },
      { label: this.i18n.common_term_operate, key: 'stack', },
    ];
    this.operationFile.columns = [
      { label: 'PID/TID', key: 'time', },
      { label: this.i18n.pcieDetailsinfo.disk_name, key: 'pid' },
      { label: 'File Name', key: '%CPU', sortKey: '%CPU' },
      { label: 'Mode', key: '%system', sortKey: '%system' },
    ];
    this.operationSys.columns = [
      { label: '%time', key: 'time', },
      { label: 'seconds', key: '%CPU' },
      { label: 'usecs/call', key: '%system' },
      { label: 'calls', key: '%user' },
      { label: 'errors', key: 'pid' },
      { label: 'Command', key: 'Command', },
      { label: 'syscall', key: 'stack', },
    ];
    this.operationNetport.columns = [
      { label: 'PID/TID', key: 'time', },
      { label: 'Protocol', key: '%CPU', },
      { label: 'Local IP', key: '%system' },
      { label: 'Local  Interface', key: '%user' },
      { label: 'Local  port', key: 'pid' },
      { label: 'Remote IP', key: 'Command', },
      { label: 'Remote Interface', key: 'stack', },
      { label: 'Remote Port', key: 'stack', },
    ];
  }
  /**
   * 查看调用栈
   * @params row 函数信息
   */
  public viewStacks(viewStack: any, row: any) {
    this.tiModal.open(viewStack, {
      id: 'hot-stacks',
      context: {

      }
    });
  }

  /**
   * 展开调用栈
   */
  public toggle(node: any) {
    node.expand = !node.expand;
    this.stacksDisplayed = this.tableService.getTreeTableArr(this.hotFunStacksData);
  }
}
