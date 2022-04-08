import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

@Component({
  selector: 'app-diagnose-task-node-config',
  templateUrl: './diagnose-task-node-config.component.html',
  styleUrls: ['./diagnose-task-node-config.component.scss']
})
export class DiagnoseTaskNodeConfigComponent implements OnInit {
  @Input()
  set nodeParams(value: boolean) {
    this.switchStatus = value;
  }
  @Input()
  set nodeList(value: any) {
    this.srcData.data = value;
  }
  @Input() runUserSwitch: any;
  @Input() runUserParams: any;
  @Input() createForm: any;
  @Output() opentNode = new EventEmitter<any>();

  public switchStatus = false; // 控制switch
  // 节点列表
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
    data: [], // 源数据
    // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
    // 已经做过的，tiny就不再做了
    // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
    // 本示例中，开发者设置了分页特性，且源数据未进行分页处理，因此tiny会对数据进行分页处理
    state: {
      searched: false, // 源数据未进行搜索处理
      sorted: false, // 源数据未进行排序处理
      paginated: false, // 源数据未进行分页处理
    },
  };
  public columns: Array<TiTableColumns> = [];
  // 国际化
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

  // 状态小圆点
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

  // 打开配置参数二级框
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
    let params = {
      nodeIp: row.node,
      nodeName: row.nickName,
      analysisTarget: this.createForm.analysisTarget,
      param: {
        ...newParams,
        assemblyLocation: this.createForm.assemblyLocation,
        sourceLocation: this.createForm.sourceLocation,
      }
    };
    if (!isAttach) {
      params = Object.assign(params, {
        runUserSwitch: this.runUserSwitch,
        runUser: {
          user_name: this.runUserParams.user_name,
          password: this.runUserParams.password
        }
      });
    }
    this.opentNode.emit(params);
  }
}
