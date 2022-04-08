import {
  Component, EventEmitter, Input, OnChanges,
  OnDestroy, OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { TiModalRef, TiModalService, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { Subscription } from 'rxjs';
import {
  TuningSysCreateTaskData,
  TuningSysMessageDetail,
  TuningSysMessageService,
  TuningSysMessageType,
  TuningSysViewTaskData,
  updateOptimizationData,
  ViewAssociatedReportData
} from 'sys/model/service';
import { RespCommon } from 'sys/src-com/app/domain';
import { LANGUAGE_TYPE, STATUS_CODE, USER_ROLE } from 'sys/src-com/app/global/constant';
import { HttpService, I18nService, TableService, TipService } from 'sys/src-com/app/service';
import { TuninghelperStatusService } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { refSug } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-record-detail/tuninghelper-record-detail.component';
import { AnalysisType, NodeType, TaskOperationType } from '../../constant';
import {
  CpuIndicator,
  IndicatorDetail,
  TreeReqParams,
  TreeRespCreateProject,
  TreeRespData,
  RelavantFormItem,
  TreeLeafOptimizationData,
  MultiTableData,
} from '../../domain';
import { OptimizationTypeEnum, SuggestionSelectValue } from '../../../../domain';
import {
  TopologyTreeMessageDetail,
  TaskDetailMessageService,
  TopologyTreeMessageType,
  TopologyTreeMessageData,
  ViewProcessThreadData
} from '../../../../service/topology-tree';
import { Cat } from 'hyper';
import { TreeOptimizationSugService } from '../tree-optimization-sug.service';
import { ProcessCpuTarget } from '../../../../process-perf/domain';
import { I18n } from 'sys/locale';
import { openDataDetailPanal } from '../../../../tuninghelper-task-detail.component';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';
const hardUrl: any = require('projects/sys/src-com/assets/hard-coding/url.json');
interface AdoptedParam {
  // 节点id
  nodeId: number;
  // 优化建议id
  id: number;
  // 0：不采纳，1：采纳
  adopted: number;
}

@Component({
  selector: 'app-tree-leaf-detail',
  templateUrl: './tree-leaf-detail.component.html',
  styleUrls: ['./tree-leaf-detail.component.scss']
})
export class TreeLeafDetailComponent implements OnInit, OnChanges, OnDestroy {

  @Input() currTreeNodeType: NodeType;
  @Input() currTreeNodeId: number;
  @Input() optimizationType: OptimizationTypeEnum;

  @Output() showPage = new EventEmitter<any>();

  @ViewChild('createProjectModal') createProjectModal: any;
  // 保存当前节点id，与传入的id进行比较，避免再次重新请求
  private currNodeId: number;

  /** 优化建议类型 */
  public optimizationTypes: {
    [name in OptimizationTypeEnum]: OptimizationTypeEnum
  } = {
      systemConfig: OptimizationTypeEnum.systemConfig,
      hotFunction: OptimizationTypeEnum.hotFunction,
      systemPerf: OptimizationTypeEnum.systemPerf,
      processPerf: OptimizationTypeEnum.processPerf,
    };

  /** 相关配置 start */

  // 相关配置 表单显示
  public relavantConfigForm: RelavantFormItem[] = [];
  // 相关配置 表格显示
  public relavantConfigTable: CommonTableData = {
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
  };
  // 相关配置 多个表格显示
  public relavantConfigMultiTableList: Array<CommonTableData> = [];
  /** 相关配置 end */

  /** 相关性能指标 start */

  // 相关性能指标 表单显示
  public relavantIndicatorForm: RelavantFormItem[] = [];
  // 相关性能指标 表格显示
  public relavantIndicatorTable: CommonTableData = {
    columnsTree: [] as Array<CommonTreeNode>,
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
  };
  // 相关性能指标 多个表格显示
  public relavantIndicatorMultiTableList: Array<CommonTableData> = [];
  /** 相关性能指标 end */

  public isAdopted: boolean;
  // 优化建议指标说明
  public indicatorDesc = '';
  // 优化建议
  public suggestion = '';
  // 优化指导
  public operation = '';
  /** 优化指导章节地址 */
  public operationPath = '';
  public i18n: any;
  public hasAuthotity = false;
  public btnText = '';
  public modalBodyText = '';
  // 分析类型
  public analysisType: AnalysisType;
  // 创建好的任务id
  public associatedTaskId: number;
  // 创建工程弹框
  private createModal: TiModalRef;
  // sys工程名
  private sysProjectName = '';
  // sys任务名
  private sysTasktName = '';
  // sys工程id
  private sysProjectId: number;
  // tab页签id
  private tabPanelId: string;
  // 节点ip
  private nodeIp: string;
  private subService: Subscription;
  // 是否是创建内存诊断分析任务
  private isCreateDiagnoseTask = false;
  // 系统配置优化建议联机帮助链接
  private sysConfigLinkUrlMap = {
    zh: hardUrl.sysConfigOnlineHelplZn,
    en: hardUrl.sysConfigOnlineHelplEn,
  };
  // 进程线程优化建议联机帮助链接
  private processPerfLinkUrlMap = {
    zh: hardUrl.tuningHelperSugUrlZn,
    en: hardUrl.tuningHelperSugUrlEn,
  };

  constructor(
    public statusService: TuninghelperStatusService,
    private http: HttpService,
    private i18nService: I18nService,
    private tiModal: TiModalService,
    private tuningSysMessageService: TuningSysMessageService,
    private taskDetailMessageService: TaskDetailMessageService,
    private sugService: TreeOptimizationSugService,
    private tipServe: TipService,
    public tableService: TableService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    const ownerId = sessionStorage.getItem('loginId');
    const role = sessionStorage.getItem('role');
    if (ownerId === this.statusService.ownerId || USER_ROLE.ADMIN === role) {
      this.hasAuthotity = true;
    } else {
      this.hasAuthotity = false;
    }
    this.tabPanelId = this.tuningSysMessageService.currActiveTab.tabPanelId;
    this.nodeIp = this.tuningSysMessageService.currActiveTab.nodeIP
      // taskDetail.nodeIP 为首次创建分析任务
      || this.tuningSysMessageService.currActiveTab.taskDetail.nodeIP;

    // 创建分析任务成功后更新优化建议
    this.subService = this.tuningSysMessageService.getMessage({
      next: (message: TuningSysMessageDetail<updateOptimizationData>) => {
        if (message.type === TuningSysMessageType.UpdateOptimization) {
          if (message.data.tabPanelId === this.tabPanelId) {
            // 更新优化建议
            this.getTreeLeafOptimization();
          }
        }
      }
    });
  }

  // 监听数据变化
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currTreeNodeId) {
      if (this.currTreeNodeType === NodeType.Leaf) {
        // 获取数据
        this.getTreeLeafOptimization();
      }
    }
  }

  ngOnDestroy(): void {
    this.subService?.unsubscribe();
  }

  /**
   * 获取阈值和采集值详情
   */
  private async getTreeLeafOptimization() {
    let params: TreeReqParams = {
      'node-id': this.statusService.nodeId,
      id: this.currTreeNodeId,
      'all-suggestion': this.statusService.suggestionSelect === SuggestionSelectValue.ThresholdFilterSuggestion
        ? false : true,
    };
    if (this.optimizationType === OptimizationTypeEnum.hotFunction) {
      params = {
        ...params,
        type: 'hot_function',
      };
    }
    const url = `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/optimization-suggestions-detail/`;
    try {
      const resp: RespCommon<TreeRespData<TreeLeafOptimizationData>> = await this.http.get(url, { params });
      this.clearData();
      if (resp.code === STATUS_CODE.SUCCESS) {
        const data = resp?.data?.optimization?.data;
        if (data && JSON.stringify(data) !== '{}') {
          // 获取叶子节点详情
          this.getLeafSugDetail(data);
        }
      }
      this.showPage.emit({});
      // 请求失败
    } catch (error) {
      this.clearData();
      this.showPage.emit({});
    }
  }

  /**
   * 清空数据
   */
  private clearData() {
    this.relavantConfigForm = [];
    this.relavantIndicatorForm = [];
    this.relavantConfigTable = {
      columnsTree: [],
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
    this.relavantIndicatorTable = {
      columnsTree: [],
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
    this.relavantConfigMultiTableList = [];
    this.relavantIndicatorMultiTableList = [];
  }
  /**
   * 获取叶子节点数据详情
   * @param data 后端返回的数据
   */
  private getLeafSugDetail(data: TreeLeafOptimizationData) {
    // 获取优化建议、操作指导、指标说明
    if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
      this.suggestion = data.sug_cn;
      this.operation = data.operation_cn;
      this.indicatorDesc = data.sug_introduction_cn;
      this.operationPath = data.online_help_cn || '';
    } else {
      this.suggestion = data.sug_en;
      this.operation = data.operation_en;
      this.indicatorDesc = data.sug_introduction_en;
      this.operationPath = data.online_help_en || '';
    }
    this.indicatorDesc = this.indicatorDesc.trim();
    if (this.indicatorDesc.length > 0) {
      if (this.indicatorDesc.substr(0, 8) === 'pagesize') {
        this.indicatorDesc = this.indicatorDesc.replace(/pagesize/, 'Page Size');
      }
    }
    this.isAdopted = data.is_accepted === 1 ? true : false;

    // 获取相关配置和性能指标
    this.getConfigAndIndicator(data);

    // 需要创建分析任务
    this.analysisType = data.analysis_type;
    this.associatedTaskId = data.associated_task_id;
    if (this.analysisType) {
      switch (this.analysisType) {
        // 查看top user进线程分析
        case AnalysisType.ProcessThreadAnalysisUser:
          this.btnText = I18n.tuninghelper.treeDetail.btnProcessThreadAnalysisUser;
          break;

        // 查看top system进线程分析
        case AnalysisType.ProcessThreadAnalysisSys:
          this.btnText = I18n.tuninghelper.treeDetail.btnProcessThreadAnalysisSystem;
          break;

        // 查看进程线程详细数据页面
        case AnalysisType.ProcessPerformanceDetail:
          this.btnText = I18n.tuninghelper.treeDetail.btnViewDetail;
          break;

        default:
          this.btnText = this.associatedTaskId ? I18n.tuninghelper.treeDetail.btnRestartTask
            : I18n.tuninghelper.treeDetail.btnCreateTask;
          break;
      }
    }
    this.sysProjectName = data.project_name;
    this.sysTasktName = data.task_name;
    this.sysProjectId = data.project_id;
    if (this.analysisType === AnalysisType.MemoryDiagnostic || this.analysisType === AnalysisType.NetioDiagnostic) {
      this.isCreateDiagnoseTask = true;
      // 内存诊断
      this.modalBodyText = this.i18nService.I18nReplace(
        I18n.tuninghelper.treeDetail.createDiagnoseProjectTip,
        {
          0: this.nodeIp,
          1: this.sysProjectName,
        },
      );
    } else {
      this.isCreateDiagnoseTask = false;
      this.modalBodyText = this.i18nService.I18nReplace(
        I18n.tuninghelper.treeDetail.createSysProjectTip,
        {
          0: this.nodeIp,
          1: this.sysProjectName,
        },
      );
    }
  }

  /**
   * 获取相关配置和性能指标
   * @param data 后端返回数据
   */
  private getConfigAndIndicator(data: TreeLeafOptimizationData) {
    // 获取相关配置和性能指标
    if (data.detail_data && JSON.stringify(data.detail_data) !== '{}') {
      const { relavant_config = [], relavant_indicator = [] } = data.detail_data;

      // 相关配置

      // 表单显示
      if (Cat.isArr(relavant_config)) {
        this.sugService.getRelavantDataForm(this.relavantConfigForm, relavant_config as Array<IndicatorDetail>);
      }
      // 表格 + 表单显示
      if (Cat.isObj(relavant_config)) {
        const { form_list = [], multi_data_list = [] } = relavant_config as CpuIndicator;
        // 有文本表单显示
        if (form_list.length) {
          this.sugService.getRelavantDataForm(this.relavantConfigForm, form_list as Array<IndicatorDetail>);
        }
        // 多个表格情况
        if (multi_data_list.length) {
          multi_data_list.forEach((tableObj: MultiTableData) => {
            this.getMultiTableList(this.relavantConfigMultiTableList, tableObj);
          });
        } else {
          // 只有一个表格
          this.sugService.getRelavantDataTable(this.relavantConfigTable, relavant_config as CpuIndicator);
        }
      }

      // 性能指标
      if (Cat.isArr(relavant_indicator)) {
        // 表单显示
        this.sugService.getRelavantDataForm(this.relavantIndicatorForm, relavant_indicator as Array<IndicatorDetail>);
      }

      if (Cat.isObj(relavant_indicator)) {
        // 表格 + 表单显示
        const { form_list = [], multi_data_list = [] } = relavant_indicator as CpuIndicator;
        if (form_list.length) {
          // 有文本表单显示
          this.sugService.getRelavantDataForm(this.relavantIndicatorForm, form_list as Array<IndicatorDetail>);
        }

        if (multi_data_list.length) {
          // 多个表格情况
          multi_data_list.forEach((tableObj: MultiTableData) => {
            this.getMultiTableList(this.relavantIndicatorMultiTableList as CommonTableData[], tableObj);
          });
        } else {
          // 只有一个表格
          this.sugService.getRelavantDataTable(this.relavantIndicatorTable, relavant_indicator as CpuIndicator);
        }

        // 热点函数优化建议详情
        if (this.optimizationType === this.optimizationTypes.hotFunction) {
          this.relavantIndicatorTable.columnsTree.forEach((column: CommonTreeNode) => {
            if (column.key === 'function') {
              column.searchKey = 'function';
              column.sortKey = '';
            }
          });
        }
      }

      // 系统配置
      if (this.optimizationType === this.optimizationTypes.systemConfig) {
        const i18nMap: any = {
          // 物理机
          physical: I18n.tuninghelper.sysConfigDetail.physical,
          // 虚拟机
          vm: I18n.tuninghelper.sysConfigDetail.vm,
          Open: I18n.sys_cof.sum.open,
          Close: I18n.sys_cof.sum.close,
        };

        this.relavantConfigForm.forEach(item => {
          item.value = i18nMap[item.value] ? i18nMap[item.value] : item.value;
        });
      }
    }
  }

  /**
   * 获取单层表格的数据
   * @param tableList 多个单层表格组成的数组
   * @param tableObj 返回的表格数据
   */
  private getMultiTableList(tableList: Array<CommonTableData>, tableObj: MultiTableData) {
    const tableData: CommonTableData = {
      columnsTree: ([] as Array<CommonTreeNode>),
      displayed: [],
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        },
      },
      title: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? tableObj.title_cn : tableObj.title_en,
      // 对应显示多层表头的表格
      tableName: tableObj.table_name,
    };
    if (tableObj.table_name === 'sub_collumn') {
      // 展开详情的表格
      this.sugService.getDoubleHeadTableData(tableData, tableObj as MultiTableData);
      tableData.isDetails = true;
      tableData.isFilters = true;
    } else if (tableObj.table_name === 'process_memory_affinity') {
      // 需要行合并的表格（内存亲和性表格）
      this.sugService.getRelavantDataTable(tableData, tableObj as MultiTableData, false);
      const col = tableObj.desc[0].indicator;
      // 行合并
      this.tableService.mergeTableRow(tableData.srcData.data, [col]);
      tableData.isNeedMergeRow = true;
    } else {
      this.sugService.getRelavantDataTable(tableData, tableObj as MultiTableData);
    }
    tableList.push(tableData);
  }

  /**
   * 采纳优化建议
   */
  public async onAdoptedSug() {
    if (!this.hasAuthotity) {
      return;
    }
    const adopted = this.isAdopted ? 0 : 1;
    const params: AdoptedParam = {
      nodeId: this.statusService.nodeId,
      id: this.currTreeNodeId,
      adopted
    };

    const resp: RespCommon<TreeRespData<any>> = await this.http.post(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/adopted-suggestions/`,
      params,
    );
    if (resp.code === STATUS_CODE.SUCCESS) {
      this.isAdopted = !this.isAdopted;
      refSug.next(this.statusService.taskId);

      // 更新选中的叶子节点图标树图
      const messageData: TopologyTreeMessageData = {
        optimizationType: this.optimizationType,
        isAdopted: this.isAdopted ? 1 : 0,
      };
      this.taskDetailMessageService.updataTopologyTree(TopologyTreeMessageType.updateLeafNode, messageData);
    }
  }

  /**
   * 查看关联报告
   */
  public viewAssociatedReport() {
    const { projectName, taskDetail } = this.tuningSysMessageService.currActiveTab;
    const message: TuningSysMessageDetail<ViewAssociatedReportData> = {
      type: TuningSysMessageType.ViewAssociatedReport,
      data: {
        projectName,
        taskDetail,
      }
    };
    this.tuningSysMessageService.sendMessage(message);
  }

  /**
   * 跳转其他页面
   */
  public async goToOtherPage(): Promise<void> {
    switch (this.analysisType) {
      // 查看top %user进程线程分析
      case AnalysisType.ProcessThreadAnalysisUser:
        this.goToProcessThreadAnalysis(ProcessCpuTarget.user);
        break;

      // 查看top %system进程线程分析
      case AnalysisType.ProcessThreadAnalysisSys:
        this.goToProcessThreadAnalysis(ProcessCpuTarget.sys);
        break;

      // 查看进程线程性能详细数据
      case AnalysisType.ProcessPerformanceDetail:
        this.goToProcessThreadDetail();
        break;

      default:
        // 跳转其他工具创建任务分析
        this.goToOtherToolsCreateTask();
        break;
    }
  }

  /**
   * 发送消息跳转进程线程性能分析页签
   * @param cpuTarget cpu指标
   */
  private goToProcessThreadAnalysis(cpuTarget: ProcessCpuTarget) {
    const message: TopologyTreeMessageDetail<ViewProcessThreadData> = {
      type: TopologyTreeMessageType.viewTopProceeThread,
      data: {
        viewCpuTarget: cpuTarget
      },
    };
    this.taskDetailMessageService.sendMessage(message);
  }

  /**
   * 查看进程线程性能详细数据
   * @param cpuTarget cpu指标
   */
  private goToProcessThreadDetail() {
    const data = {
      type: 'processPerfData',
      taskType: 'tuninghelperDateiledData',
      nodeId: this.statusService.nodeId,
      taskId: this.statusService.taskId,
      ownerId: this.statusService.ownerId,
      title: I18n.tuninghelper.taskDetail.processPerfData,
    };
    openDataDetailPanal.next(data);
  }

  /**
   * 前往其他工具创建、重启分析任务
   */
  private async goToOtherToolsCreateTask() {
    // 创建任务分析之前，先或取工程或者任务是否存在
    await this.getTreeLeafOptimization();
    if (this.associatedTaskId) {
      // 已经存在分析任务，重启分析
      this.openCreateTaskTab(TaskOperationType.Restart);
    } else {
      // 创建分析任务
      if (!this.sysProjectId) {
        // 工程不存在，先创建工程
        this.createModal = this.tiModal.open(this.createProjectModal, {
          id: 'createProjectModal',
          modalClass: 'create-project-modal'
        });
      } else {
        // 工程已存在，直接打开创建任务的页签
        this.openCreateTaskTab(TaskOperationType.Create);
      }
    }
  }
  /**
   * 查看报告
   */
  public viewReport() {
    const message: TuningSysMessageDetail<TuningSysViewTaskData> = {
      type: TuningSysMessageType.ViewSysTask,
      data: {
        // 节点id
        nodeId: this.statusService.nodeId,
        taskId: this.associatedTaskId, // 任务的id
        analysisType: this.analysisType,  // 任务分析类型,
        taskName: this.sysTasktName,  // 任务名称
        projectName: this.sysProjectName,  // 工程名称
        nodeIP: this.nodeIp,  // 节点IP
        isFromTuningHelper: true,  // 调优助手创建任务的标识
        isCreateDiagnoseTask: this.isCreateDiagnoseTask,
      },
    };

    this.tuningSysMessageService.sendMessage(message);
  }

  /**
   * 创建工程
   */
  public async newProject() {
    const params = {
      projectName: this.sysProjectName,
      nodeList: [this.statusService.nodeId],
    };
    let url;
    if (this.isCreateDiagnoseTask) {  // 系统诊断
      url = '/diagnostic-project/';
    } else {  // 系统性能分析
      url = '/projects/';
      Object.assign(params, { sceneId: 11 });  // sceneId 后端通用场景id
    }
    try {
      const resp: RespCommon<TreeRespCreateProject> = await this.http.post(url, params);
      if (resp.code === STATUS_CODE.SUCCESS) {  // 创建工程成功
        this.createModal.close();
        this.sysProjectId = resp?.data?.id;
        this.openCreateTaskTab(TaskOperationType.Create);
      }
    } catch (error) {
      this.tipServe.alertInfo({
        type: 'error',
        content: error.message,
        time: 3500
      });
    }

  }

  /**
   * 打开创建、重启任务tab页
   * @param type create or restart
   */
  private openCreateTaskTab(type: TaskOperationType) {
    // 创建分析任务
    const message: TuningSysMessageDetail<TuningSysCreateTaskData> = {
      type: TuningSysMessageType.CreateSysTask,
      data: {
        scenes: 3,  // 前端通用场景
        task: {
          projectId: this.sysProjectId,  // 创建好的工程id
          projectName: this.sysProjectName,  // 创建好的工程名
          analysisType: this.analysisType,  // 任务分析类型
          nodeId: this.statusService.nodeId,  // 节点id
          nickName: this.nodeIp,
          suggestionId: this.currTreeNodeId,  // 优化建议id
          optimizationId: this.statusService.taskId,  // 调优助手任务id
          isFromTuningHelper: true,  // 调优助手创建任务的标识
          tabPanelId: this.tabPanelId,
          id: this.associatedTaskId,  // 已创建的分析任务id
          sysTasktName: this.sysTasktName,  // 已创建的分析任务名
          isCreateDiagnoseTask: this.isCreateDiagnoseTask,
        },
        type,
      },
    };

    this.tuningSysMessageService.sendMessage(message);
  }

  /**
   * 判断是否有相关配置数据
   */
  get hasRelavantConfig() {
    return this.relavantConfigForm.length || this.relavantConfigTable.srcData.data.length
      || this.relavantConfigMultiTableList.length;
  }

  /**
   * 判断是否有相关性能指标数据
   */
  get hasRelavantIndicator() {
    return this.relavantIndicatorForm.length || this.relavantIndicatorTable.srcData.data.length
      || this.relavantIndicatorMultiTableList.length;
  }

  /**
   * 优化指导-打开联机帮助
   */
  public openOperationHelp() {
    if (this.operationPath) {
      if (document.body.className.includes('vscode')) {
        const a = document.createElement('a');
        let tuningHelperSugUrl = '';
        if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
          tuningHelperSugUrl = this.getTuningHelperSugUrl('zh');
        } else {
          tuningHelperSugUrl = this.getTuningHelperSugUrl('en');
        }
        a.setAttribute('href', tuningHelperSugUrl);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        let url = `${window.location.origin}${window.location.pathname}./assets/tuning-assistant-help`;
        if (sessionStorage.getItem('language') === 'en-us') {
          url += '/en/index.html';
        } else {
          url += '/zh/index.html';
        }
        window.open(url, '_blank');
      }
    }
  }

  /**
   * 获取系统配置、进程线程优化建议联机帮助地址
   * @param lang lang
   * @return 联机帮助地址
   */
  private getTuningHelperSugUrl(lang: 'zh' | 'en') {
    if (this.optimizationType === this.optimizationTypes.systemConfig) {
      return this.sysConfigLinkUrlMap[lang];
    }
    switch (this.optimizationType) {
      case this.optimizationTypes.systemConfig:
        return this.sysConfigLinkUrlMap[lang];
        break;
      case this.optimizationTypes.processPerf:
        return this.processPerfLinkUrlMap[lang];
        break;
      default:
        return '';
        break;
    }
  }
}
