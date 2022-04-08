import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { AxiosService } from '../../../service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { TaskService } from '../../../service/taskService/nodeList.service';

@Component({
  selector: 'app-mission-node-thread',
  templateUrl: './mission-node-thread.component.html',
  styleUrls: ['./mission-node-thread.component.scss']
})
export class MissionNodeThreadComponent implements OnInit {

  constructor(
    public i18nService: I18nService,
    private Axios: AxiosService,
    public taskServices: TaskService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('mission_config') missionConfig: any;
  @Input() formData: any = '';
  @Input() isAbled: boolean;
  @Input() taskType: string;
  @Input() projectId: number;
  @Input() nodeConfigShow: boolean;
  @Output() private forControlNode = new EventEmitter<any>();
  // 节点列表
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public checkedList: Array<TiTableRowData> = []; // 默认选中项
  public columns: Array<TiTableColumns> = [];
  // 国际化
  public i18n: any;
  public localeable = false;

  // 获取节点ip列表
  public nodeDatas = new Array();
  public processStatus = false;

  ngOnInit() {
    this.columns = [
      {
        title: this.i18n.nodeConfig.nickName,
      },
      {
        title: this.i18n.nodeConfig.node,
      },
      {
        title: this.i18n.nodeConfig.processId,
      },
    ];
    this.srcData = {
      // 表格源数据，开发者对表格的数据设置请在这里进行
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
  }

  public getProjectNodes(method: any) {
    this.forControlNode.emit(this.taskType);
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.Axios.axios[method](url).then((res: any) => {
      this.srcData.data = res.data.nodeList.map((item: any) => {
        const nickName = item.nickName;
        const node = item.nodeIp;
        const nodeState = item.nodeStatus;
        const status = item.status;
        const nodeId = item.nodeId;
        const id = item.id;
        const params = {
          status: false,
          pid: '',
        };
        return {
          nickName,
          node,
          status,
          nodeState,
          params,
          nodeId,
          id,
        };
      });
    });
  }
  public getNodeListStatus() {
    // 设置个定时器异步下，因为displayed的数据还没刷到srcData.data上
    let pid = '';
    setTimeout(() => {
      this.processStatus = true;
      this.srcData.data.forEach((item) => {
        pid = item.params.pid;
        if ( pid === '') {
          this.processStatus = false;
          return;
        } else {
          this.processStatus = true;
        }
      });
    }, 10);
  }
  // 状态小圆点
  public statusFormat(status: boolean): string {
    let statusClass = '';
    switch (status) {
      case true:
        statusClass = 'success-icon';
        break;
      case false:
        statusClass = 'reserve-icon';
        break;
      default:
        statusClass = 'reserve-icon';
        break;
    }
    return statusClass;
  }
  public clear() {
    this.formData = '';
    this.srcData.data = [];
    this.forControlNode.emit('');
  }
  public getNodesConfigParams(): object {
    const nodeConfig: any = [];
    this.srcData.data.forEach((item, index) => {
      nodeConfig.push({
        nodeId: item.id,
        nickName: item.nickName,
        task_param: Object.assign({}, this.formData, item.params),
      });
    });
    return nodeConfig;
  }
  public getNodesConfigParamsAll() {
    this.forControlNode.emit('process-thread-analysis');
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    return new Promise((resolve, reject) => {
      this.Axios.axios.get(url).then((res: any) => {
        const nodeConfig: any = [];
        res.data.nodeList.forEach((item: any) => {
          const params = {
            pid: '',
            status: false,
          };
          nodeConfig.push({
            nodeId: item.id,
            task_param: Object.assign({}, this.formData, params),
          });
        });
        resolve(nodeConfig);
        return nodeConfig;
      });
    });

  }
  public importTemp(e: any) {
    this.processStatus = false;
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.Axios.axios.get(url).then((res: any) => {
      this.srcData.data = res.data.nodeList.map((item: any) => {
        const nickName = item.nickName;
        const node = item.nodeIp;
        const nodeState = item.nodeStatus;
        const status = item.status;
        const nodeId = item.nodeId;
        const id = item.id;
        const params = {
          pid: '',
        };
        e.forEach((items: any, index: any) => {
          if (item.nickName === items.nodeName || item.nickName === items.nodeNickName || item.id === items.nodeId) {
            params.pid = items.task_param.pid;
          }
        });
        return {
          nickName,
          node,
          status,
          nodeState,
          params,
          nodeId,
          id,
        };
      });
      this.getNodeListStatus();
    });
  }
}
