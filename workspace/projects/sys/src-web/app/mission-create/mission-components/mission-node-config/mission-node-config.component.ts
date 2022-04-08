import {
  Component, Input, ViewChild, Output,
  EventEmitter, SimpleChanges, OnChanges
} from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { AxiosService } from '../../../service/axios.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { TaskService } from '../../../service/taskService/nodeList.service';
import { __core_private_testing_placeholder__ } from '@angular/core/testing';
import { LaunchRunUser } from 'projects/sys/src-web/app/domain';
import { AnalysisType } from 'projects/sys/src-com/app/domain';

@Component({
  selector: 'app-mission-node-config',
  templateUrl: './mission-node-config.component.html',
  styleUrls: ['./mission-node-config.component.scss']
})
export class MissionNodeConfigComponent implements OnChanges {
  constructor(
    public i18nService: I18nService,
    private Axios: AxiosService,
    public taskServices: TaskService
  ) {
    this.i18n = this.i18nService.I18n();

    this.columns = [
      {
        title: '',
      },
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
  @ViewChild('mission_config') missionConfig: any;
  @Input() labelWidth: string;
  @Input() formData: any = '';
  @Input() isAbled: boolean;
  @Input() taskType: string;
  @Input() projectId: number;
  @Input() nodeConfigShow: boolean;
  @Input() nodeConfigedData: any;
  @Output() controlNode = new EventEmitter<any>();
  @Output() opentNode = new EventEmitter<any>();
  @Input() runUserData: {
    runUser: boolean,
    user: string,
    password: string
  };
  @Input() isModifySchedule: boolean;
  @Input() runUserDataObj: LaunchRunUser;
  @Input() nodeList: any[];
  @Output() forControlNode = new EventEmitter<any>();
  @Output() forOpenNode = new EventEmitter<any>();
  @Output() selectNodeDisable = new EventEmitter<boolean>();
  // 控制switch
  public switchStatus = false;
  // 节点列表
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public checkedList: Array<TiTableRowData> = []; // 默认选中项
  public columns: Array<TiTableColumns> = [];
  // 国际化
  public i18n: any;
  // 控制开关
  public controlOpen: any;
  // 接收参数值，发布订阅
  public parmasObj: any;
  // 获取节点ip列表
  public nodeDatas = new Array();


  ngOnChanges(changes: SimpleChanges) {
    if (changes?.nodeConfigedData) {
      const data = changes.nodeConfigedData.currentValue;
      if (data) {
        if (Object.keys(data).length !== 0) {
          const nickName = data.nickName;
          this.srcData.data.forEach((item) => {
            if (item.nickName === nickName) {
              item.params = Object.assign({}, item.params, data.formData);
              item.params.status = true;
              item.runUser = Object.assign({}, item.runUser, data.runUser);
            }
          });
          this.runUserDataObj[this.nodeConfigedData.nickName] = {
            runUser: changes.nodeConfigedData.currentValue.runUser?.runUser,
            user_name: changes.nodeConfigedData.currentValue.runUser?.user,
            password: changes.nodeConfigedData.currentValue.runUser?.password
          };
        }
      }
    } else if (changes.formData) {
      delete this.formData.sqlUser;
      delete this.formData.sqlPwd;
    }
  }
  // 控制开启开关
  public onSwitchChange(event: any) {
    this.selectNodeDisable.emit(event);
    if (event) {
      this.controlNode.emit(this.taskType);
      this.getProjectNodes();
    } else {
      this.clear();
    }
    this.switchStatus = event;
  }
  public getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.Axios.axios.get(url).then((res: any) => {
      let nodeList = res.data.nodeList;
      if (this.nodeList){
        nodeList = this.nodeList;
      }
      this.srcData.data = nodeList.map((item: any) => {
        const nickName = item.nickName;
        const node = item.nodeIp;
        const nodeState = item.nodeStatus;
        const nodeId = item.nodeId;
        const id = item.id;
        const params = {
          status: false,
        };
        return {
          nickName,
          node,
          nodeState,
          params,
          nodeId,
          id,
        };
      });
    });
  }
  // 打开配置参数二级框
  public onConfigParams(row: any) {
    const title = row.nickName + '(' + row.node + ')';
    const type = this.formData
      ? this.formData['analysis-type'] || this.formData.analysisType
      : row.params['analysis-type'] || row.analysisType;
    let firstName = '';
    let endName = '';
    switch (type) {
      case 'C/C++ Program':
        firstName = 'c_';
        break;
      case 'process-thread-analysis':
        firstName = 'p_';
        break;
        case AnalysisType.Hpc:
        firstName = 'r_';
        break;
      case 'system_lock':
        firstName = 'l_';
        break;
      case 'resource_schedule':
        firstName = 'r_';
        break;
      case 'miss_event':
        break;
      case 'microarchitecture':
        firstName = 'm_';
        break;
      case 'system':
        firstName = 'd_';
        break;
      default:
        break;
    }
    const target = this.formData
      ? this.formData['analysis-target'] || this.formData.analysisTarget
      : row.params['analysis-target'] || row.params.analysisTarget;
    endName =
      target.indexOf('Launch') !== -1
        ? 'launch'
        : target.indexOf('Attach') !== -1
          ? 'attach'
          : 'profile';
    // 打开对应的二级侧滑框
    let params: any;
    if (target.indexOf('Launch') !== -1) {
      let runUserData: any;
      if (Object.keys(this.runUserDataObj).length === 0) {
        runUserData = this.runUserData;
      } else if (Object.keys(this.runUserDataObj).includes(row.node)) {
        runUserData = {
          runUser: this.runUserDataObj[row.node].runUser,
          user: this.runUserDataObj[row.node].user_name,
          password: this.runUserDataObj[row.node].password,
        };
      } else {
        runUserData = this.runUserData;
      }
      params = {
        nodeIP: row.node,
        nodeName: row.nickName,
        key: firstName + endName,
        title,
        param: '',
        runUser: runUserData,
        isModifySchedule: this.isModifySchedule
      };
    } else {
      params = {
        nodeIP: row.node,
        nodeName: row.nickName,
        key: firstName + endName,
        title,
        param: '',
      };
    }
    // 传递响应节点名称和IP
    // 传递表单数据
    this.srcData.data.forEach((item, index) => {
      if (Object.keys(item.params).length === 1) {
        item.params = Object.assign({}, item.params, this.formData);
      }
      if (item.nickName === row.nickName) {
        // 创建模板时没有该节点，但是导入模板后有该节点时 配置节点参数的params为{}
        params.param = Object.keys(item.params).length ? item.params : this.formData;
      }
    });
    this.opentNode.emit(params);
  }
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
  public clear() {
    this.switchStatus = false;
    this.formData = '';
    this.srcData.data = [];
    this.controlNode.emit('');
  }
  public getNodesConfigParams(formData?: any): object {
    const nodeConfig: any = [];
    this.srcData.data.forEach((item) => {
      nodeConfig.push({
        nodeId: item.id,
        nickName: item.node,
        task_param: Object.assign({}, formData || this.formData, item.params),
      });
    });
    return nodeConfig;
  }
  public importTemp(e: any) {
    this.switchStatus = true;
    this.selectNodeDisable.emit(this.switchStatus);
    this.controlNode.emit(this.taskType);
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    if (this.nodeList) {
      this.nodeTableDataDealwith(this.nodeList, e);
    } else {
      this.Axios.axios.get(url).then((res: any) => {
        this.nodeTableDataDealwith(res.data.nodeList, e);
      });
    }
  }

  /**
   * 导入数据-根据节点数据获取表格数据
   * @param nodeList 节点数据
   * @param e 任务数据
   */
   private nodeTableDataDealwith(nodeList: Array<any>, e: any) {
    this.srcData.data = e.map((items: any, index: any) => {
      let nodeState = '';
      let nodeId = '';
      let nickName = '';
      let node = '';
      let params = {};
      nodeList.forEach((item: any) => {
        if (item.nickName === items.nodeName || item.nickName === items.nodeNickName || item.id === items.nodeId) {
          nodeState = item.nodeStatus;
          nodeId = item.nodeId;
          nickName = item.nickName;
          node = item.node || item.nodeIp;
          let taskParam = '';
          if (Object.prototype.hasOwnProperty.call(items, 'taskParam')) {
            taskParam = items.taskParam;
          } else {
            taskParam = items.task_param;
          }
          params = Object.assign({}, this.formData, taskParam);
        }
      });
      return {
        nickName,
        node,
        nodeState,
        params,
        nodeId,
        id: items.nodeId,
      };
    });
  }
}
