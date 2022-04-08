// 节点列表【用途：节点管理、新建工程、编辑工程、查看工程节点列表】
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent, } from '@cloud/tiny3';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import * as Util from 'projects/sys/src-web/app/util';
import { HPC_NODE_NUM_MAX } from 'sys/src-com/app/global/constant';
import { TaskStatus } from 'sys/src-com/app/domain';

// columns 的接口
interface TableColumn extends TiTableColumns {
  prop: string;
  title: string;
}

@Component({
  selector: 'app-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.scss']
})

export class NodeListComponent implements OnInit, OnDestroy {
  @Input() selectMode = 'none';
  /** 是否有node详情列【端口、用户名和安装路径(创建功能、修改工程和查看工程信息只有一个节点时，这3个参数空白不好看，就不显示这三列了)】 */
  @Input() hasNodeDetails = false;
  @Input() hasOperate = false;  // 添加操作列
  @Input() hasAlarmInfo = false;  // 添加运行目录和日志目录列
  @Input() hasPagination = false;
  @Input() nodeList: Array<any>;
  @Input() selectedNodeIds: number[];
  @Input() nodeNumLimit: number;
  @Output() editNodeName = new EventEmitter();
  @Output() deleteNode = new EventEmitter();
  @Output() selectedNodeIdsChange = new EventEmitter();
  @Output() viewLogs = new EventEmitter();
  @Output() maxNodeAllow = new EventEmitter<boolean>();

  public role = sessionStorage.getItem('role');
  public i18n: any;
  public destroy = false; // 刚好在收到轮询节点列表的结果之后设置定时器之前，调用ngOnDestroy销毁定时器时，不能清除掉轮询
  public obtainingTableData = false;

  public columns: Array<TableColumn> = [];
  public srcData: TiTableSrcData;
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public search = {
    words: ['', '', ''],
    keys: ['nodeName', 'nodeIP', 'username'],
  };

  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50],
    size: 10
  };

  // 运行目录and日志目录
  public subscription: any;
  public alarmInfo: any = {};
  public nodeStatusList: any = {};
  public getNodesTimeout: any;
  public allNodeIds: any = [];
  public isSelected = false; // 表格展示数据方式
  public originTotal: number;
  readonly nodeStatusEnum = TaskStatus;

  private originNodeList: any[];
  private url: any;

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public msgService: MessageService,
    private urlService: UrlService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.url = this.urlService.Url();
    const operateList = {
      edit: {
        label: this.i18n.common_term_operate_edit,
        onclick: (node: any) => this.editNodeName.emit(node),
      },
      delete: {
        label: this.i18n.common_term_operate_del,
        onclick: (node: any) => this.deleteNode.emit(node),
      },
      viewLogs: {
        label: this.i18n.nodeManagement.viewLog,
        onclick: (node: any) => this.viewLogs.emit(node),
      },
    };

    this.nodeStatusList = {
      on: { // 在线
        text: this.i18n.node.online,
        color: '#61d274',
        operate: (nodeInfo: any) => this.isLocalNode(nodeInfo) ? [operateList.edit]
          : [operateList.edit, operateList.viewLogs, operateList.delete],
      },
      off: {  // 离线
        text: this.i18n.node.offline,
        color: '#ccc',
        operate: (nodeInfo: any) => this.isLocalNode(nodeInfo) ? [operateList.edit]
          : [operateList.edit, operateList.viewLogs, operateList.delete],
      },
      init: { // 添加中
        text: this.i18n.nodeManagement.adding,
        operate: (nodeInfo: any) => this.isLocalNode(nodeInfo) ? [] : [operateList.viewLogs],
      },
      lock: { // 删除中
        text: this.i18n.nodeManagement.deleting,
        operate: (nodeInfo: any) => this.isLocalNode(nodeInfo) ? [] : [operateList.viewLogs],
      },
      update: { // 更新中
        text: this.i18n.nodeManagement.updating,
        operate: (nodeInfo: any) => this.isLocalNode(nodeInfo) ? [] : [operateList.viewLogs],
      },
      mismatch: { // 版本不匹配
        text: this.i18n.nodeManagement.mismatch, color: '#F45C5E',
        operate: (nodeInfo: any) => this.isLocalNode(nodeInfo) ? [] : [operateList.viewLogs, operateList.delete],
      },
      failed: { // 失败
        text: this.i18n.status_Failed, color: '#F45C5E',
        operate: (nodeInfo: any) => this.isLocalNode(nodeInfo) ? [] : [operateList.viewLogs, operateList.delete],
      },
    };
  }

  ngOnInit() {
    this.columns = [
      {
        prop: 'nodeName',
        title: this.i18n.nodeManagement.nodeName,
        search: true,
        searchIndex: 0
      },
      {
        prop: 'nodeStatus',
        title: this.i18n.common_term_node_status,
        filter: true,
        options: Object.keys(this.nodeStatusList).map(key => {
            const label = this.nodeStatusList[key].text;
            return { key, label};
        }),
        multiple: true,
        selected: [],
      },
      {
        prop: 'nodeIP',
        title: this.i18n.nodeConfig.node,
        search: true,
        searchIndex: 1
      },
    ];

    if (this.hasNodeDetails) {
      this.columns.push({
        prop: 'port',
        title: this.i18n.nodeManagement.nodePort
      });
      this.columns.push({
        prop: 'username',
        title: this.i18n.common_term_login_name,
        search: true,
        searchIndex: 2
      });
      this.columns.push({
        prop: 'installPath',
        title: this.i18n.nodeManagement.installPath
      });
    }

    if (this.hasAlarmInfo) {
      this.columns.push({
        prop: 'Installation', title: this.i18n.nodeManagement.runDirectory,
        iconTip: this.i18n.nodeManagement.runDirectoryTip
      });
      this.columns.push({
        prop: 'Log', title: this.i18n.nodeManagement.logDirectory,
        iconTip: this.i18n.nodeManagement.logDirectoryTip
      });

      this.msgService.sendMessage({
        type: 'sendAlarmInfo',
        status: true,
      });

      // 目录数据处理
      /**
       * 显示逻辑：
       *  1、True为红色，False为黄色，Normal为蓝色
       *  2、disk和tool都为统一状态时，以tool为准，例如：disk为ture，tool为false，
       * 取disk的TRUE显示；disk为false，tool为false，取tool的false显示
       *  3、后端返回的都是MB单位，
       *  4、前端显示：日志目录的工作空间是MB为单位,其余的都是GB为单位
       */
      const i18n = this.i18n;
      const gaugeColors: any = {
        True: '#ED4B4B',
        False: '#FF9B00',
        Normal: '#0067ff',
      };
      const decimalNum = 2; // 保留两位小数
      const parse = (value: any) => Util.fixThouSeparator((+value).toFixed(decimalNum));
      // 磁盘的词条和数值
      const diskData = (key: any, data: any, level: any) => {
        const res: any = {
          usageRatio: [0, null, undefined, '0'].includes(data.disk_value_total) ? 0
          : (1 - data.disk_value_free / data.disk_value_total) * 100,
          gaugeColor: gaugeColors[level],
        };
        const unit = 'GB';
        if (res.usageRatio < 20) { res.usageRatio = 20; }

        res.free = `${i18n.memInfo.disk.title22}${
          i18n.common_term_colon} ${parse(data.disk_value_free / 1024)} ${unit}`;
        res.total = `${i18n.memInfo.disk.title1}${parse(data.disk_value_total / 1024)} ${unit}`;
        res.suggest = `${i18n.memInfo.disk.title_suggestFree}${
          i18n.common_term_colon} > ${parse(data.disk_value_space / 1024)} ${unit}`;

        if (['True', 'False'].includes(level)) {
          res.suggestion = this.i18n.memInfo.disk.tip1;
        }
        return res;
      };
      // 工作空间的词条和数值
      const toolData = (key: any, data: any, level: any) => {
        const res: any = {
          usageRatio: [0, null, undefined, '0'].includes(data.tool_value_total) ? 0
          : (1 - data.tool_value_free / data.tool_value_total) * 100,
          gaugeColor: gaugeColors[level],
        };
        let unit = 'GB';
        if (res.usageRatio < 20) { res.usageRatio = 20; }

        if (key.endsWith('Log')) {
          unit = 'MB';
          res.free = `${i18n.memInfo.space.title22}${i18n.common_term_colon} ${parse(data.tool_value_free)} ${unit}`;
          res.total = `${i18n.memInfo.space.title_total}${
            i18n.common_term_colon} ${parse(data.tool_value_total)} ${unit}`;
          res.suggest = `${i18n.memInfo.space.title_suggestFree}${
            i18n.common_term_colon} > ${parse(data.tool_value_space)} ${unit}`;
        } else {
          res.free = `${i18n.memInfo.space.title22}${
            i18n.common_term_colon} ${parse(data.tool_value_free / 1024)} ${unit}`;
          res.total = `${i18n.memInfo.space.title_total}${
            i18n.common_term_colon} ${parse(data.tool_value_total / 1024)} ${unit}`;
          res.suggest = `${i18n.memInfo.space.title_suggestFree}${
            i18n.common_term_colon} > ${parse(data.tool_value_space / 1024)} ${unit}`;
        }

        if (['True', 'False'].includes(level)) {
          res.suggestion = this.i18n.memInfo.space.tip1;
        }
        return res;
      };
      const parseData = (key: any, data: any) => {
        if (data.tool_alarm === 'True') {
          return toolData(key, data, 'True');
        } else if (data.disk_alarm === 'True') {
          return diskData(key, data, 'True');
        } else if (data.tool_alarm === 'False') {
          return toolData(key, data, 'False');
        } else if (data.disk_alarm === 'False') {
          return diskData(key, data, 'False');
        } else {
          return toolData(key, data, 'Normal');
        }
      };

      this.subscription = this.msgService.getMessage().subscribe(msg => {
        if (msg.type === 'alarmInfo') {
          Object.keys(msg.data).forEach(key => msg.data[key] = parseData(key, msg.data[key]));
          this.alarmInfo = msg.data;
        }
      });
    }

    if (this.role !== 'Admin') { this.hasOperate = false; }
    if (this.hasOperate) {
      this.columns.push({ prop: 'operate', title: this.i18n.common_term_operate, width: '200px' });
    }

    this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };

    // 如果没有传递下来的 nodeList 则获取节点信息【查看工程信息直接下发表格数据，无需获取】
    if (this.nodeList) {
      this.srcData.data = this.formatNodeList(this.nodeList);
    } else {
      this.getNodes(true);
      this.getNodesTimeout = setInterval(() => {
        this.getNodes();
      }, 5000);
    }
  }

  ngOnDestroy() {
    this.destroy = true;
    if (this.getNodesTimeout) {
      clearTimeout(this.getNodesTimeout);
      this.getNodesTimeout = null;
    }

    if (this.hasAlarmInfo) {
      this.msgService.sendMessage({
        type: 'sendAlarmInfo',
        status: false,
      });
      this.subscription.unsubscribe();
    }
  }

  // 判断是否是本地节点【安装包自身的节点】
  public isLocalNode(nodeInfo: any) {
    // 端口、用户名和安装路径都没有的就是本地节点(此判断条件有变)  agent的网口为22
    return !nodeInfo.nodePort;
  }

  public formatNodeList(nodeList: any[]) {
    return nodeList.map((item: any) => {
      const operate = this.nodeStatusList[item.nodeStatus].operate;

      return {
        id: item.id,
        nodeName: item.nickName,
        nodeStatus: item.nodeStatus,
        nodeStatusInfo: item.nodeStatusInfo,
        nodeIP: item.nodeIp,
        port: item.nodePort,
        username: item.userName,
        installPath: item.installPath,
        operate: typeof operate === 'function' ? operate(item) : operate,
      };
    });
  }

  public getNodes(showLoading = false) {
    const params = {
      'auto-flag': 'on',
      page: 1,
      'per-page': HPC_NODE_NUM_MAX,
    };

    this.obtainingTableData = showLoading;
    this.Axios.axios.get(this.url.nodes, { params }).then((res: any) => {
      const data = res.data;

      const tabelData: any[] = this.formatNodeList(data.nodeList);
      this.originNodeList = [...tabelData];
      this.originTotal = data.totalCounts;
      this.allNodeIds = tabelData.map(item => item.id);

      this.maxNodeAllow.emit(tabelData.length >= HPC_NODE_NUM_MAX);
      this.onNodeStatusSelect(this.isSelected);
    }).finally(() => {
      this.obtainingTableData = false;
    });
  }

  public trackByFn(index: number, item: any): number {
    return item.ip;
  }

  // 需要根据剩余空间是否超出隐藏来判断tips框中是否添加剩余空间的显示
  public updateGaugeTipContent(el: any, obj: any) {
    const span = el.hostEle.childNodes[1];
    obj.hasOverflow = span.scrollWidth > span.offsetWidth;
  }

  public isNull(params: any) {
    return isNaN(params) || [null, undefined, ''].includes(params);
  }

  /**
   * 筛选切换
   * @param bool 是否切换选中
   */
   onNodeStatusSelect(bool: boolean) {
    this.isSelected = bool;
    // 从每一行进行过滤筛选
    this.srcData.data = this.originNodeList.filter((rowData: TiTableRowData) => {
      // 遍历所有列
      for (const columnData of this.columns) {
        // 只有筛选列有选中项时进行筛选，如果某一筛选列选中项不包含当前行数据，则跳出循环
        if (columnData.selected && columnData.selected.length) {
          const index: number = columnData.selected.findIndex((item: any) => {
            return item.key === rowData[columnData.prop];
          });
          if (index < 0) {
            return false;
          }
        }
      }

      return true;
    });
    if (bool) {
      this.srcData.data = this.srcData.data.filter(node => {
        return this.selectedNodeIds.some(item => {
          return item === node.id;
        });
      });
    }
  }
}
