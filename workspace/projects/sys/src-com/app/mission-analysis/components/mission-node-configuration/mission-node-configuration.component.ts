import {
  Component, ContentChild, ElementRef, Input, OnInit, TemplateRef, ViewChild, OnChanges, SimpleChanges
} from '@angular/core';
import { Options, NodeInfo, ImportedConfig } from './doman';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { TiTableRowData, TiTableSrcData, TiTableColumns, TiModalService, TiModalRef } from '@cloud/tiny3';

@Component({
  selector: 'app-mission-node-configuration',
  templateUrl: './mission-node-configuration.component.html',
  styleUrls: ['./mission-node-configuration.component.scss']
})
export class MissionNodeConfigComponent implements OnInit, OnChanges {

  @ContentChild(TemplateRef, { static: true }) nodeConfigForm: TemplateRef<any>;

  @ViewChild('configNodeModal') configNodeModal: ElementRef;

  /** 工程id，用于查询节点列表 */
  @Input() projectId: number;
  /** 组件配置 */
  @Input() options: Options;
  /** 导入的节点配置，该输入值会在每次更新时覆盖对应节点的config属性 */
  @Input() importConfig: ImportedConfig;
  /**
   * 配置状态，每当这个值变更，列表中的配置状态都会更新这个值设定的状态
   */
  @Input() configStatus?: boolean;
  /** 配置节点参数的表单valid */
  @Input() formValid: boolean;
  /** 配置节点参数的表单value */
  @Input() formValue: unknown;

  public defaultOptions: Options;
  public i18n: any;
  // 表格配置
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false,
    },
  };
  public columns: Array<TiTableColumns>;

  private nodeConfigModal: TiModalRef;

  constructor(
    private i18nService: I18nService,
    private http: HttpService,
    private tiModal: TiModalService
  ) {
    this.i18n = this.i18nService.I18n();
    this.defaultOptions = {
      label: this.i18n.mission_create.nodeParamsConfig,
      switch: {
        disabled: true,
        status: false,
        tip: this.i18n.nodeConfig.nodeTip,
        hoverTip: this.i18n.mission_create.paramsConfigNotice
      }
    };
    this.initTable();
  }

  ngOnInit(): void {
    this.defaultOptions = Object.assign(this.defaultOptions, this.options);
    this.initNodeListData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options && this.options) {
      this.defaultOptions = Object.assign(this.defaultOptions, this.options);
    }
    if (changes.importConfig && this.importConfig) {
      this.srcData.data.forEach((item: NodeInfo) => {
        item.config = this.importConfig[item.id];
      });
    }
    if (changes.configStatus && this.configStatus !== undefined) {
      this.srcData.data.forEach((item: NodeInfo) => {
        item.configStatus = Boolean(this.configStatus);
      });
    }
  }

  private initTable() {
    this.columns = [
      {
        title: this.i18n.nodeConfig.nickName,
        width: '22%'
      },
      {
        title: this.i18n.nodeConfig.node,
        width: '25%'
      },
      {
        title: this.i18n.nodeConfig.status,
        width: '25%'
      },
      {
        title: this.i18n.nodeConfig.action,
        width: '28%'
      },
    ];
  }

  private initNodeListData() {
    this.http.get(`/projects/${encodeURIComponent(this.projectId)}/info/`).then((resp: any) => {
      this.srcData.data = resp.data.nodeList;
    });
  }

  /**
   * 点击配置参数事件
   * 弹出配置节点弹窗
   *
   * @param row 当前配置的节点的行数据
   *
   * row.config会被传出去，外部通过row.config获取已经或者未被配置的属性
   *
   * 可能读取到undifined，请自行处理表单赋值
   */
  public configParams(row: NodeInfo) {
    const beforeClose = this.defaultOptions.beforeConfig;
    if (typeof beforeClose === 'function') {
      beforeClose(row);
    }
    this.nodeConfigModal = this.tiModal.open(this.configNodeModal, {
      id: 'configNodeModal',
      context: { row }
    });
  }

  public ok(row: NodeInfo) {
    row.config = this.formValue;
    row.configStatus = true;

    const afterClose = this.defaultOptions.afterConfig;
    let result = true;
    if (typeof afterClose === 'function') {
      result = afterClose(row);
    }

    if (result) {
      this.nodeConfigModal.close();
    }
  }

  public onSwitchChange(status: boolean) {
    const onSwitchChange = this.defaultOptions.switch.onSwitchChange;
    if (typeof onSwitchChange === 'function') {
      onSwitchChange(status);
    }
  }

}
