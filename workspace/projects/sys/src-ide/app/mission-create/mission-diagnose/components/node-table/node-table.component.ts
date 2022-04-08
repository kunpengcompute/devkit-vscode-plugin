import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

@Component({
  selector: 'app-node-table',
  templateUrl: './node-table.component.html',
  styleUrls: ['./node-table.component.scss']
})
export class NodeTableComponent implements OnInit {
  @Input()
  set nodeParams(value: boolean) {
    this.switchStatus = value;
  }
  @Input()
  set nodeList(value: any) {
    this.srcData.data = value;
  }
  @Input() createForm: any;
  @Output() opentNode = new EventEmitter<any>();

  public switchStatus = false; // 控制switch
  // 节点列表
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false,
    },
  };
  public columns: Array<TiTableColumns> = [];
  public i18n: any;
  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();

    this.columns = [
      {
        title: this.i18n.nodeConfig.nickName,
      },
      {
        title: this.i18n.nodeConfig.node,
      },
      {
        title: this.i18n.nodeConfig.status,
      },
      {
        title: this.i18n.nodeConfig.action,
      },
    ];
  }

  ngOnInit() { }

  public statusFormat(status: boolean): string {
    let statusClass = '';
    switch (status) {
      case true:
        statusClass = 'success-icon';
        break;
      default:
        statusClass = 'reserve-icon';
        break;
    }
    return statusClass;
  }

  public onConfigParams(row: any) {
    const isAttach = this.createForm.analysisTarget === 'Attach to Process';
    const newParams = !isAttach
      ? {
        appDir: this.createForm.appDir,
        appParameters: this.createForm.appParameters
      }
      : {
        processPid: this.createForm.processPid,
        processName: this.createForm.processName
      };
    // 打开对应的二级侧滑框
    const params = {
      nodeIp: row.node,
      nodeName: row.nickName,
      status: row.params.status,
      analysisTarget: this.createForm.analysisTarget,
      param: {
        ...newParams,
        assemblyLocation: this.createForm.assemblyLocation,
        sourceLocation: this.createForm.sourceLocation,
      }
    };
    this.opentNode.emit(params);
  }
}
