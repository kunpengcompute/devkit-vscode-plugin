import { Component, OnInit, Input, Output, EventEmitter, ElementRef, SecurityContext } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MemAnalysisModeForm } from 'projects/sys/src-web/app/mission-create/taskParams/modules/MemAnalysisModeForm';
import { MemAccessForm } from 'projects/sys/src-web/app/mission-create/taskParams/modules/MemAccessForm';
import { MissEventForm } from 'projects/sys/src-web/app/mission-create/taskParams/modules/MissEventForm';
import { FalseSharingForm } from 'projects/sys/src-web/app/mission-create/taskParams/modules/FalseSharingForm';
import * as Util from 'projects/sys/src-web/app/util';
import { HpcPresetType, AnalysisTarget, AnalysisScene } from 'projects/sys/src-web/app/domain';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigTableService } from '../../linkage-detail/service/config-table.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { ToolType } from 'projects/domain';
import { MemPerfUrl } from 'sys/src-web/url/memperf';

const hardUrl: any = require('../../../../assets/hard-coding/url.json');

interface TaskInfoItemType {
  key: string;
  text: string;
  requier: string;
  status: string;
  taskcode: string;
}

interface IParentConfig {
  key: string;
  text: string;
  requier: string;
  order: number;
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  private url: any;
  public isDiagnose = false;
  public privateType = '';
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() status: any;
  @Input()
  get type(): string {
    return this.privateType;
  }
  set type(type: string) {
    this.privateType = type;
    this.configList.forEach((element, index) => {
      if (element.key === this.i18n.sys.type) {
        this.configList[index].text = this.presetTypeDict.get(this.privateType as HpcPresetType) || '--';
      }
    });
  }
  @Input() taskDetail: any;

  @Output() private returnConfigInfo = new EventEmitter<any>();
  i18n: any;
  public obtainingTaskInfo = false;
  constructor(
    private Axios: AxiosService,
    public mytip: MytipService,
    public i18nService: I18nService,
    private el: ElementRef,
    private domSanitizer: DomSanitizer,
    public configTableService: ConfigTableService,
    private urlService: UrlService,
  ) {
    this.url = this.urlService.Url();
    this.i18n = this.i18nService.I18n();
    this.kunpengcomputeDevkitdriverGithubUrl = hardUrl.kunpengcomputeDevkitdriverGithubUrl;
    this.presetTypeDict = new Map([
      [HpcPresetType.Topdown, this.i18n.hpc.hpc_target.hpc_top_down],
      [HpcPresetType.Summary, this.i18n.hpc.summary],
      [HpcPresetType.InstrucMix, this.i18n.hpc.hpc_target.directives]
    ]);
  }
  public kunpengcomputeDevkitdriverGithubUrl: any;
  public hpcUserGuideUrl = hardUrl.hpc_user_guide;
  public configList: Array<any> = [];
  public arrStatus = false;
  public timeData: any = [];
  public simplingArr = [
    { id: 'badSpeculation', text: 'Bad Speculation', tip: 'testtest' },
    { id: 'frontEndBound', text: 'Front-End Bound', tip: 'testtest' },
    { id: 'resourceBound', text: 'Back-End Bound->Resource Bound', tip: 'testtest' },
    { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: 'testtest' },
    { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: 'testtest' },
  ];
  public arrowSelection: JQuery;
  public linkageData: TiTableSrcData;
  public mpiDisplayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public mpiData: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns> = [];
  public presetTypeDict: Map<HpcPresetType, string>;
  ngOnInit() {
    if (this.taskDetail?.isCreateDiagnoseTask) {  // 调优助手优化建议创建的诊断分析任务
      this.url = MemPerfUrl;
    } else {
      this.url = this.urlService.Url();
    }
    this.srcData = {
      data: this.mpiData,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.columns = [
      {
        title: this.i18n.nodeConfig.node,
        width: '50%'
      },
      {
        title: this.i18n.hpc.mission_create.rankNum,
        width: '50%'
      },
    ];
    // 所有任务字典
    const analysisTypesDir: any = {
      system: this.i18n.sys_summary.cpupackage_tabel.sysPro,
      resource_schedule: this.i18n.mission_create.resSchedule,
      microarchitecture: this.i18n.mission_create.structure,
      'process-thread-analysis': this.i18n.mission_create.process,
      mem_access: this.i18n.mission_modal.memAccessAnalysis,
      miss_event: this.i18n.mission_modal.memAccessAnalysis,
      falsesharing: this.i18n.mission_modal.memAccessAnalysis,
      'C/C++ Program': this.i18n.mission_create.cPlusPlus,
      system_lock: this.i18n.mission_create.lock,
      ioperformance: this.i18n.mission_create.io,
      hpc_analysis: this.i18n.mission_create.hpc,
      memory_diagnostic: this.i18n.diagnostic.common_title
    };
    this.linkageData = {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    };
    if (this.taskDetail?.isCreateDiagnoseTask) {  // 调优助手优化建议创建的诊断分析任务
      this.isDiagnose = true;
    } else {
      this.isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
    }
    let url = '';
    if (this.analysisType === 'task_contrast') {
      url = '/tasks/taskcontrast/configuration/?taskId=' + this.taskid;
    } else {
      url = this.url.toolTask +
        encodeURIComponent(this.taskid) +
        (this.isDiagnose ? '' : '/common') +
        '/configuration/?node-id=' + this.nodeid;
    }

    this.obtainingTaskInfo = true;
    this.Axios.axios.get(url, {
      headers: {
        showLoading: false,
      }
    })
      .then((resp: any) => {
        this.obtainingTaskInfo = false;
        if (resp.data) {
          let taskStatus = '';
          let nodeNickName: string;
          let nodeData: any;
          let analysisType: string;
          let statusCode: string;
          let analysisTarget: string;
          const configInfo = [];
          if (this.analysisType !== 'task_contrast') {
            const allNodeData = resp.data.nodeConfig.filter((item: any) => {
              return item.nodeId = this.nodeid;
            });
            taskStatus = allNodeData[0].taskStatus;
            nodeNickName = allNodeData[0].nodeNickName;
            statusCode = allNodeData[0].statusCode;
            nodeData = allNodeData[0].task_param || allNodeData[0].taskParam;
            analysisType = nodeData['analysis-type'] || nodeData.analysisType || resp.data.analysisType;
            if (analysisType.indexOf('C++') > -1) {
              if (nodeData['analysis-target'].indexOf('Launch') > -1) {
                const typeOptions = [
                  {
                    label: this.i18n.micarch.typeItem_all,
                    id: 'all',
                  },
                  {
                    label: this.i18n.micarch.typeItem_user,
                    id: 'user',
                  },
                  {
                    label: this.i18n.micarch.typeItem_kernel,
                    id: 'kernel',
                  },
                ];
                const item = typeOptions.find(val => {
                  return val.id === nodeData.samplingSpace;
                });
                const typeItem = item ? item.label : '--';
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_app_path,
                    text: (nodeData['app-dir'] !== undefined && nodeData['app-dir'] !== '')
                      ? nodeData['app-dir']
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_parameters,
                    text: (nodeData['app-parameters'] !== undefined && nodeData['app-parameters'] !== '')
                      ? nodeData['app-parameters'] : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_interval_ms + ' (' + (nodeData.interval === '0.71'
                      ? this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                    text: this.getInterval(nodeData.interval),
                    requier: ''
                  },

                  {
                    key: this.i18n.common_term_task_crate_bs_path,
                    text: (nodeData.assemblyLocation !== undefined && nodeData.assemblyLocation !== '')
                      ? nodeData.assemblyLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_c_path,
                    text: (nodeData.sourceLocation !== undefined && nodeData.sourceLocation !== '')
                      ? nodeData.sourceLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.kcore,
                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                  },
                  {
                    key: this.i18n.falsesharing.filesize + this.i18n.ddr.leftParenthesis
                      + 'MiB' + this.i18n.ddr.rightParenthesis,
                    text: (nodeData.size !== undefined && nodeData.size !== '') ? nodeData.size : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.ddr.samplingRange,
                    text: typeItem,
                    requier: ''
                  }
                ];
              } else if (nodeData['analysis-target'].indexOf('Profile') > -1) {
                const typeOptions = [
                  {
                    label: this.i18n.micarch.typeItem_all,
                    id: 'all',
                  },
                  {
                    label: this.i18n.micarch.typeItem_user,
                    id: 'user',
                  },
                  {
                    label: this.i18n.micarch.typeItem_kernel,
                    id: 'kernel',
                  },
                ];
                const item = typeOptions.find(val => {
                  return val.id === nodeData.samplingSpace;
                });
                const typeItem = item ? item.label : '--';
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_interval_ms + ' (' + (nodeData.interval === '0.71'
                      ? this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                    text: this.getInterval(nodeData.interval),
                    requier: ''
                  },
                  {
                    key: this.i18n.ddr.cpuToBeSamples,
                    text: (nodeData['cpu-mask'] !== undefined && nodeData['cpu-mask'] !== '')
                      ? nodeData['cpu-mask']
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_bs_path,
                    text: (nodeData.assemblyLocation !== undefined && nodeData.assemblyLocation !== '')
                      ? nodeData.assemblyLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_c_path,
                    text: (nodeData.sourceLocation !== undefined && nodeData.sourceLocation !== '')
                      ? nodeData.sourceLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_duration,
                    text: (nodeData.duration !== undefined && nodeData.duration !== '')
                      ? nodeData.duration
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.kcore,
                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                  },
                  {
                    key: this.i18n.falsesharing.filesize + this.i18n.ddr.leftParenthesis
                      + 'MiB' + this.i18n.ddr.rightParenthesis,
                    text: (nodeData.size !== undefined && nodeData.size !== '') ? nodeData.size : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.ddr.samplingRange,
                    text: typeItem,
                    requier: ''
                  }
                ];
              } else if (nodeData['analysis-target'].indexOf('Attach') > -1) {
                const typeOptions = [
                  {
                    label: this.i18n.micarch.typeItem_all,
                    id: 'all',
                  },
                  {
                    label: this.i18n.micarch.typeItem_user,
                    id: 'user',
                  },
                  {
                    label: this.i18n.micarch.typeItem_kernel,
                    id: 'kernel',
                  },
                ];
                const item = typeOptions.find(val => {
                  return val.id === nodeData.samplingSpace;
                });
                const typeItem = item ? item.label : '--';
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_interval_ms + ' (' + (nodeData.interval === '0.71'
                      ? this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                    text: this.getInterval(nodeData.interval),
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_pid,
                    text: (nodeData['target-pid'] !== undefined && nodeData['target-pid'] !== '')
                      ? nodeData['target-pid']
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.process_alias,
                    text: nodeData.process_name || nodeData['process-name'] || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_bs_path,
                    text: (nodeData.assemblyLocation !== undefined && nodeData.assemblyLocation !== '')
                      ? nodeData.assemblyLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_c_path,
                    text: (nodeData.sourceLocation !== undefined && nodeData.sourceLocation !== '')
                      ? nodeData.sourceLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_duration,
                    text: (nodeData.duration !== undefined && nodeData.duration !== '') ? nodeData.duration : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.kcore,
                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                  },
                  {
                    key: this.i18n.falsesharing.filesize + this.i18n.ddr.leftParenthesis
                      + 'MiB' + this.i18n.ddr.rightParenthesis,
                    text: (nodeData.size !== undefined && nodeData.size !== '') ? nodeData.size : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.ddr.samplingRange,
                    text: typeItem,
                    requier: ''
                  }
                ];
              }
            } else if (analysisType === 'system') {
              this.configList = [
                {
                  key: this.i18n.task_name,
                  text: nodeData.taskname,
                },
                {
                  key: this.i18n.sys.interval,
                  text: nodeData.interval,
                },
                {
                  key: this.i18n.sys.duration,
                  text: nodeData.duration,
                },
              ];

            } else if (analysisType === 'ioperformance') {

              this.configList = [
                {
                  key: this.i18n.task_name,
                  text: nodeData.taskname,
                },
                {
                  key: this.i18n.sys.duration,
                  text: nodeData.duration,
                },
                {
                  key: this.i18n.storageIO.statistical,
                  text: nodeData.statistical,
                },
                {
                  key: this.i18n.falsesharing.filesize
                    + ' '
                    + this.i18n.ddr.leftParenthesis
                    + 'MiB'
                    + this.i18n.ddr.rightParenthesis,
                  text: nodeData.size ? nodeData.size : '--',
                  requier: ''
                },
                {
                  key: this.i18n.storageIO.callstack,
                  text: nodeData.stack === true ? this.i18n.process.enable : this.i18n.process.disable,
                },
              ];
              if (nodeData.analysisTarget.indexOf('Launch') > -1) {
                this.configList.splice(1, 0, {
                  key: this.i18n.common_term_task_crate_app_path,
                  text: nodeData['app-dir'] || nodeData.appDir || '--',
                  requier: ''
                });
                this.configList.splice(2, 0,
                  {
                    key: this.i18n.common_term_task_crate_parameters,
                    text: (nodeData['app-parameters'] !== undefined && nodeData['app-parameters'] !== '') ?
                     nodeData['app-parameters'] : '--',
                    requier: ''
                  });
              }
              if (nodeData.analysisTarget.indexOf('Attach') > -1) {
                this.configList.splice(1, 0, {
                  key: this.i18n.common_term_task_crate_pid,
                  text: nodeData.targetPid || '--',
                  requier: ''
                });
                this.configList.splice(2, 0,
                  {
                    key: this.i18n.mission_create.process_alias,
                    text: nodeData.process_name || nodeData['process-name'] || '--',
                    requier: '',
                  });
              }
            } else if (analysisType.indexOf('resource') > -1) {
              if (nodeData['analysis-target'].indexOf('Launch') > -1) {
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_app_path,
                    text: (nodeData['app-dir'] !== undefined && nodeData['app-dir'] !== '')
                      ? nodeData['app-dir']
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_parameters,
                    text: (nodeData['app-parameters'] !== undefined && nodeData['app-parameters'] !== '') ?
                     nodeData['app-parameters'] : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_bs_path,
                    text: (nodeData.assemblyLocation !== undefined && nodeData.assemblyLocation !== '')
                      ? nodeData.assemblyLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.collectCallStack,
                    text: nodeData['dis-callstack'] === undefined ? '--' : (nodeData['dis-callstack']
                      ? this.i18n.process.enable : this.i18n.process.disable),
                    requier: ''
                  },
                  {
                    key: this.i18n.falsesharing.filesize
                      + ' '
                      + this.i18n.ddr.leftParenthesis
                      + 'MiB'
                      + this.i18n.ddr.rightParenthesis,
                    text: nodeData.size ? nodeData.size : '--',
                    requier: ''
                  },
                ];
              } else if (nodeData['analysis-target'].indexOf('Profile') > -1) {
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_duration,
                    text: (nodeData.duration !== undefined && nodeData.duration !== '') ? nodeData.duration : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_bs_path,
                    text: (nodeData.assemblyLocation !== undefined && nodeData.assemblyLocation !== '')
                      ? nodeData.assemblyLocation : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.collectCallStack,
                    text: nodeData['dis-callstack'] === undefined ? '--' : (nodeData['dis-callstack']
                      ? this.i18n.process.enable : this.i18n.process.disable),
                    requier: ''
                  },
                  {
                    key: this.i18n.falsesharing.filesize
                      + ' '
                      + this.i18n.ddr.leftParenthesis
                      + 'MiB'
                      + this.i18n.ddr.rightParenthesis,
                    text: nodeData.size ? nodeData.size : '--',
                    requier: ''
                  },
                ];
              } else if (nodeData['analysis-target'].indexOf('Attach') > -1) {
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_pid,
                    text: (nodeData['target-pid'] !== undefined && nodeData['target-pid'] !== '')
                      ? nodeData['target-pid']
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.process_alias,
                    text: nodeData['target-comm'] || nodeData['process-name'] || '--',
                    requier: '',
                  },
                  {
                    key: this.i18n.common_term_task_crate_duration,
                    text: (nodeData.duration !== undefined && nodeData.duration !== '') ? nodeData.duration : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_bs_path,
                    text: (nodeData.assemblyLocation !== undefined && nodeData.assemblyLocation !== '')
                      ? nodeData.assemblyLocation : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.collectCallStack,
                    text: nodeData['dis-callstack'] === undefined ? '--' : (nodeData['dis-callstack']
                      ? this.i18n.process.enable : this.i18n.process.disable),
                    requier: ''
                  },
                  {
                    key: this.i18n.falsesharing.filesize
                      + ' '
                      + this.i18n.ddr.leftParenthesis
                      + 'MiB'
                      + this.i18n.ddr.rightParenthesis,
                    text: nodeData.size ? nodeData.size : '--',
                    requier: ''
                  },
                ];
              }
            } else if (analysisType === 'microarchitecture') {
              let simplingIndex = '';
              let samplingSpace = '';
              this.simplingArr.forEach(val => {
                if (nodeData.analysisIndex.indexOf(val.id) > -1) {
                  simplingIndex += ',' + val.text;
                }
              });
              if (simplingIndex) {
                simplingIndex = simplingIndex.slice(1);
              } else {
                simplingIndex = '--';
              }

              if (nodeData.samplingSpace === 'all') {
                samplingSpace = this.i18n.micarch.typeItem_all;
              } else if (nodeData.samplingSpace === 'user') {
                samplingSpace = this.i18n.micarch.typeItem_user;
              } else if (nodeData.samplingSpace === 'kernel') {
                samplingSpace = this.i18n.micarch.typeItem_kernel;
              } else {
                samplingSpace = '--';
              }

              if (nodeData.analysisTarget.indexOf('Launch') > -1) {
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_app_path,
                    text: nodeData.appDir || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_parameters,
                    text: nodeData.appParameters || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.label.simpling,
                    text: nodeData.samplingMode || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.sys.duration,
                    text: nodeData.duration || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_modal.syslock.cpu_interval,
                    text: nodeData.interval || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.label.analysis,
                    text: simplingIndex,
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.label.typeItem,
                    text: samplingSpace,
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.simpling_delay,
                    text: nodeData.samplingDelay ? nodeData.samplingDelay : nodeData.samplingDelay === 0 ? 0 : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_c_path,
                    text: (nodeData.sourceLocation !== undefined && nodeData.sourceLocation !== '')
                      ? nodeData.sourceLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.kcore,
                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.collection_size,
                    text: nodeData.perfDataLimit ? nodeData.perfDataLimit : '--',
                    requier: ''
                  },
                ];
              } else if (nodeData.analysisTarget.indexOf('Profile') > -1) {
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.micarch.label.simpling,
                    text: nodeData.samplingMode || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.sys.duration,
                    text: nodeData.duration || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_modal.syslock.cpu_interval,
                    text: nodeData.interval || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.label.analysis,
                    text: simplingIndex,
                    requier: ''
                  },
                  {
                    key: this.i18n.ddr.cpuToBeSamples,
                    text: nodeData.cpuMask ? nodeData.cpuMask : nodeData.cpuMask === 0 ? 0 : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.label.typeItem,
                    text: samplingSpace,
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.simpling_delay,
                    text: nodeData.samplingDelay ? nodeData.samplingDelay : nodeData.samplingDelay === 0 ? 0 : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_c_path,
                    text: (nodeData.sourceLocation !== undefined && nodeData.sourceLocation !== '')
                      ? nodeData.sourceLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.kcore,
                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                  },
                  {
                    key: this.i18n.falsesharing.filesize
                      + ' '
                      + this.i18n.ddr.leftParenthesis
                      + 'MiB'
                      + this.i18n.ddr.rightParenthesis,
                    text: nodeData.perfDataLimit ? nodeData.perfDataLimit : '--',
                    requier: ''
                  },

                ];
              } else if (nodeData.analysisTarget.indexOf('Attach') > -1) {
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_pid,
                    text: nodeData.targetPid || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.process_alias,
                    text: nodeData.process_name || nodeData['process-name'] || '--',
                    requier: '',
                  },
                  {
                    key: this.i18n.micarch.label.simpling,
                    text: nodeData.samplingMode || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.sys.duration,
                    text: nodeData.duration || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_modal.syslock.cpu_interval,
                    text: nodeData.interval || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.label.analysis,
                    text: simplingIndex,
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.label.typeItem,
                    text: samplingSpace,
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.simpling_delay,
                    text: nodeData.samplingDelay ? nodeData.samplingDelay : nodeData.samplingDelay === 0 ? 0 : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_c_path,
                    text: (nodeData.sourceLocation !== undefined && nodeData.sourceLocation !== '')
                      ? nodeData.sourceLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.kcore,
                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                  },
                  {
                    key: this.i18n.falsesharing.filesize
                      + ' '
                      + this.i18n.ddr.leftParenthesis
                      + 'MiB'
                      + this.i18n.ddr.rightParenthesis,
                    text: nodeData.perfDataLimit ? nodeData.perfDataLimit : '--',
                    requier: ''
                  },
                ];
              }
            } else if (analysisType === 'process-thread-analysis') {  // 进程/线程分析
              let a = '';
              const taskType: any = {
                net: this.i18n.sys.net,
                cpu: this.i18n.sys.cpu,
                mem: this.i18n.sys.mem,
                disk: this.i18n.sys.disk,
                hard: this.i18n.sys_cof.check_types.hard,
                soft: this.i18n.sys_cof.check_types.soft,
                env: this.i18n.sys_cof.check_types.env,
                cache_access: this.i18n.ddr.types.cache_access,
                ddr_access: this.i18n.ddr.types.ddr_access,
                context: this.i18n.process.context,
              };
              nodeData.task_param.type.forEach((item: any, index: any) => {
                if (index < nodeData.task_param.type.length - 1) {
                  a += taskType[item] + this.i18n.sys.douhao;
                } else {
                  a += taskType[item];
                }
              });
              let appOrPidConfig: any = [];
              switch (nodeData['analysis-target']) {
                case 'Attach to Process':
                  appOrPidConfig = [
                    {
                      key: 'PID',
                      text: nodeData.pid || '--',
                      requier: '',
                    },
                    {
                      key: this.i18n.process.label.trace,
                      text: nodeData['strace-analysis'] === 'enable'
                        ? this.i18n.process.enable
                        : this.i18n.process.disable,
                      requier: ''
                    },
                    {
                      key: this.i18n.mission_create.process_alias,
                      text: nodeData.process_name || '--',
                      requier: '',
                    }
                  ];
                  break;
                case 'Launch Application':
                  appOrPidConfig = [
                    {
                      key: this.i18n.common_term_task_crate_app_path,
                      text: nodeData['app-dir'] || '--',
                      requier: '',
                    },
                    {
                      key: this.i18n.process.label.trace,
                      text: nodeData['strace-analysis'] === 'enable'
                        ? this.i18n.process.enable
                        : this.i18n.process.disable,
                      requier: ''
                    },
                    {
                      key: this.i18n.mission_modal.cProcess.app_params,
                      text: nodeData['app-parameters'] || '--',
                      requier: '',
                    }
                  ];
                  break;
                default:
              }
              this.configList = [
                {
                  key: this.i18n.task_name,
                  text: nodeData.taskname,
                  requier: ''
                },
                ...appOrPidConfig,
                {
                  key: this.i18n.sys.duration,
                  text: nodeData.duration,
                  requier: ''
                },
                {
                  key: this.i18n.sys.interval,
                  text: nodeData.interval,
                  requier: ''
                },
                {
                  key: this.i18n.sys.type,
                  text: a,
                  requier: ''
                }
              ];
              if (resp.data.switch) {
                this.configList.push({
                  key: this.i18n.nodeConfig.processId,
                  text: nodeData.pid,
                  requier: ''
                }, {
                  key: this.i18n.process.trace,
                  text: nodeData['strace-analysis'] === 'enable' ? this.i18n.process.enable : this.i18n.process.disable,
                  requier: ''
                });
              }
              this.configList.push({
                key: this.i18n.process.tread,
                text: nodeData.thread === 'enable' ? this.i18n.process.enable : this.i18n.process.disable,
                requier: ''
              });
            } else if (analysisType.indexOf('system_lock') > -1) {
              const typeOptions = [
                {
                  label: this.i18n.micarch.typeItem_all,
                  id: 'ALL',
                },
                {
                  label: this.i18n.micarch.typeItem_user,
                  id: 'USER',
                },
                {
                  label: this.i18n.micarch.typeItem_kernel,
                  id: 'SYS',
                },
              ];
              const item = typeOptions.find(val => {
                return val.id === nodeData.collect_range;
              });
              const typeItem = item ? item.label : '--';
              if (nodeData['analysis-target'].indexOf('Launch') > -1) {
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_app_path,
                    text: (nodeData['app-dir'] !== undefined && nodeData['app-dir'] !== '')
                      ? nodeData['app-dir']
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_parameters,
                    text: (nodeData['app-parameters'] !== undefined && nodeData['app-parameters'] !== '')
                      ? nodeData['app-parameters'] : '--',
                    requier: ''
                  },

                  {
                    key: this.i18n.common_term_task_crate_interval_ms + ' (' + (nodeData.interval === '0.71'
                      ? this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                    text: this.getInterval(nodeData.interval),
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.label.typeItem,
                    text: typeItem,
                    requier: ''
                  },

                  {
                    key: this.i18n.lock.form.functions_analysis,
                    text: nodeData.functionname ? nodeData.functionname.split('^_{,2}').join('') : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_bs_path,
                    text: (nodeData.assemblyLocation !== undefined && nodeData.assemblyLocation !== '')
                      ? nodeData.assemblyLocation : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_c_path,
                    text: (nodeData.sourceLocation !== undefined && nodeData.sourceLocation !== '')
                      ? nodeData.sourceLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.kcore,
                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.collection_size,
                    text: nodeData.collect_file_size ? nodeData.collect_file_size : '--',
                    requier: ''
                  },
                ];
              } else if (nodeData['analysis-target'].indexOf('Profile') > -1) {
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_duration,
                    text: (nodeData.duration !== undefined && nodeData.duration !== '') ? nodeData.duration : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_interval_ms + ' (' + (nodeData.interval === '0.71'
                      ? this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                    text: this.getInterval(nodeData.interval),
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.label.typeItem,
                    text: typeItem,
                    requier: ''
                  },
                  {
                    key: this.i18n.lock.form.functions_analysis,
                    text: nodeData.functionname ? nodeData.functionname.split('^_{,2}').join('') : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_bs_path,
                    text: (nodeData.assemblyLocation !== undefined && nodeData.assemblyLocation !== '')
                      ? nodeData.assemblyLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_c_path,
                    text: (nodeData.sourceLocation !== undefined && nodeData.sourceLocation !== '')
                      ? nodeData.sourceLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.kcore,
                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.collection_size,
                    text: nodeData.collect_file_size ? nodeData.collect_file_size : '--',
                    requier: ''
                  },
                ];
              } else if (nodeData['analysis-target'].indexOf('Attach') > -1) {
                this.configList = [
                  {
                    key: this.i18n.task_name,
                    text: nodeData.taskname,
                  },
                  {
                    key: this.i18n.common_term_task_crate_pid,
                    text: (nodeData['target-pid'] !== undefined && nodeData['target-pid'] !== '')
                      ? nodeData['target-pid']
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.process_alias,
                    text: nodeData.process_name || nodeData['process-name'] || '--',
                    requier: '',
                  },
                  {
                    key: this.i18n.common_term_task_crate_duration,
                    text: (nodeData.duration !== undefined && nodeData.duration !== '') ? nodeData.duration : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_interval_ms + ' (' + (nodeData.interval === '0.71'
                      ? this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                    text: this.getInterval(nodeData.interval),
                    requier: ''
                  },
                  {
                    key: this.i18n.micarch.label.typeItem,
                    text: typeItem,
                    requier: ''
                  },
                  {
                    key: this.i18n.lock.form.functions_analysis,
                    text: nodeData.functionname ? nodeData.functionname.split('^_{,2}').join('') : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_bs_path,
                    text: (nodeData.assemblyLocation !== undefined && nodeData.assemblyLocation !== '')
                      ? nodeData.assemblyLocation : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_c_path,
                    text: (nodeData.sourceLocation !== undefined && nodeData.sourceLocation !== '')
                      ? nodeData.sourceLocation
                      : '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.kcore,
                    text: nodeData.kcore ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.collection_size,
                    text: nodeData.collect_file_size ? nodeData.collect_file_size : '--',
                    requier: ''
                  },
                ];
              }
            } else if (analysisType.indexOf('mem_access') > -1) {  // 访存统计分析
              const parentFormEl = new MemAnalysisModeForm();
              parentFormEl.generateFormGroup();
              parentFormEl.customForm({ formEl: parentFormEl });
              const formEl = new MemAccessForm(); // 访存统计分析的表单参数
              formEl.generateFormGroup();
              const values = formEl.paramsToValues({ params: JSON.parse(JSON.stringify(nodeData)) });
              parentFormEl.setValues({
                values,
                formEl: parentFormEl,
                type: 'text',
                i18n: this.i18n,
              });
              const parentFormElDisplayedElementList = parentFormEl.displayedElementList.filter(item => {
                return !['analysisObject', 'analysisMode', 'analysisType'].includes(item);
              });
              const parentConfigList = parentFormElDisplayedElementList.map(item => {
                const el = parentFormEl.form[item];
                return {
                  key: el.label,
                  text: [undefined, ''].includes(el.text) ? '--' : el.text,
                  requier: '',
                  order: el.order
                };
              }).sort((a, b) => a.order - b.order);
              formEl.setValues({
                values,
                formEl,
                type: 'text',
                i18n: this.i18n
              });
              const configList = formEl.displayedElementList.map(item => {
                const el = formEl.form[item];
                return {
                  key: el.label,
                  text: [undefined, ''].includes(el.text) ? '--' : el.text,
                  requier: '',
                  order: el.order
                };
              }).sort((a, b) => a.order - b.order);
              this.configList = [...parentConfigList, ...configList];
              this.returnConfigInfo.emit({ formElList: [parentFormEl, formEl], values });
            } else if (analysisType.indexOf('miss_event') > -1) {  // Miss事件统计
              const parentFormEl = new MemAnalysisModeForm();
              parentFormEl.generateFormGroup();
              parentFormEl.customForm({ formEl: parentFormEl });
              const formEl = new MissEventForm(); // Miss事件统计的表单参数
              formEl.generateFormGroup();
              const values = formEl.paramsToValues({ params: JSON.parse(JSON.stringify(nodeData)) });
              parentFormEl.setValues({
                values,
                formEl: parentFormEl,
                type: 'text',
                i18n: this.i18n,
              });
              const parentFormElDisplayedElementList = parentFormEl.displayedElementList.filter(item => {
                return !['analysisObject', 'analysisMode', 'analysisType'].includes(item);
              });
              const parentConfigList: any = [];
              parentFormElDisplayedElementList.map(item => {
                if (['switchState', 'user_name', 'password'].indexOf(item) === -1) {
                  const el = parentFormEl.form[item];
                  parentConfigList.push({
                    key: el.label,
                    text: [undefined, ''].includes(el.text) ? '--' : el.text,
                    requier: '',
                    order: el.order
                  });
                }
              });
              parentConfigList.sort((a: IParentConfig, b: IParentConfig) => a.order - b.order);
              if (formEl.setAnalysisObject) {
                formEl.setAnalysisObject(values.analysisObject === 'analysisObject_sys'
                  ? 'analysisObject_sys'
                  : values.analysisMode);
              }
              formEl.setValues({
                values,
                formEl,
                type: 'text',
                i18n: this.i18n
              });
              const configList = formEl.displayedElementList.map(item => {
                const el = formEl.form[item];
                return {
                  key: el.label,
                  text: [undefined, ''].includes(el.text) ? '--' : el.text,
                  requier: '',
                  order: el.order
                };
              }).sort((a, b) => a.order - b.order);
              this.configList = [...parentConfigList, ...configList];
              this.returnConfigInfo.emit({ formElList: [parentFormEl, formEl], values });
            } else if (analysisType.indexOf('falsesharing') > -1) {  // 伪共享分析
              const parentFormEl = new MemAnalysisModeForm();
              parentFormEl.generateFormGroup();
              parentFormEl.customForm({ formEl: parentFormEl });
              const formEl: any = new FalseSharingForm(this.i18n); // 伪共享分析的表单参数
              formEl.generateFormGroup();
              const values = formEl.paramsToValues({ params: JSON.parse(JSON.stringify(nodeData)) });
              parentFormEl.setValues({
                values,
                formEl: parentFormEl,
                type: 'text',
                i18n: this.i18n,
              });
              const parentFormElDisplayedElementList = parentFormEl.displayedElementList.filter(item => {
                return !['analysisObject', 'analysisMode', 'analysisType'].includes(item);
              });
              const parentConfigList: any = [];
              parentFormElDisplayedElementList.map(item => {
                if (['switchState', 'user_name', 'password'].indexOf(item) === -1) {
                  const el = parentFormEl.form[item];
                  parentConfigList.push({
                    key: el.label,
                    text: [undefined, ''].includes(el.text) ? '--' : el.text,
                    requier: '',
                    order: el.order
                  });
                }
              });
              parentConfigList.sort((a: IParentConfig, b: IParentConfig) => a.order - b.order);
              if (formEl.setAnalysisObject) {
                formEl.setAnalysisObject(values.analysisObject === 'analysisObject_sys'
                  ? 'analysisObject_sys'
                  : values.analysisMode);
              }
              formEl.setValues({
                values,
                formEl,
                type: 'text',
                i18n: this.i18n
              });
              const configList = formEl.displayedElementList.map((item: any) => {
                const el = formEl.form[item];
                return {
                  key: el.label,
                  text: [undefined, ''].includes(el.text) ? '--' : el.text,
                  requier: '',
                  order: el.order
                };
              }).sort((a: any, b: any) => a.order - b.order);
              this.configList = [...parentConfigList, ...configList];
              this.returnConfigInfo.emit({ formElList: [parentFormEl, formEl], values });
            } else if (analysisType === 'hpc_analysis') {
              let appOrPidConfig: any = [];
              let mpiEnvDirStatus: any = [];
              if (nodeData['analysis-target'] === AnalysisTarget.LAUNCH_APPLICATION) {
                appOrPidConfig = [
                  {
                    key: this.i18n.common_term_task_crate_app_path,
                    text: nodeData['app-dir'] || '--',
                    requier: '',
                  },
                  {
                    key: this.i18n.mission_modal.cProcess.app_params,
                    text: nodeData['app-parameters'] || '--',
                    requier: '',
                  },
                  {
                    key: this.i18n.mission_modal.hpc.mission_create.collectionType,
                    text: nodeData.mpi_status ? this.i18n.mission_modal.hpc.mpi : this.i18n.mission_modal.hpc.openMp,
                    requier: '',
                  }
                ];
              } else if (nodeData['analysis-target'] === AnalysisTarget.ATTACH_TO_PROCESS) {
                appOrPidConfig = [
                  {
                    key: this.i18n.common_term_task_crate_pid,
                    text: nodeData.pid || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.process_alias,
                    text: nodeData.process_name || '--',
                    requier: '',
                  },
                ];
              }
              if (nodeData.mpi_status) {
                mpiEnvDirStatus = [
                  {
                    key: this.i18n.hpc.mission_create.mpi_env_dir,
                    text: nodeData.mpi_env_dir || '--',
                    requier: '',
                  },
                  {
                    key: this.i18n.hpc.mission_create.runNodes,
                    text: nodeData.master_ip || '--',
                    requier: '',
                  },
                  {
                    key: this.i18n.hpc.mission_create.rankNodes,
                    text: '',
                    requier: '',
                  }
                ];
                nodeData.hpc_mlt_rank_info.forEach((element: any) => {
                  const nodeName = element.IP;
                  const rank = element.rank;
                  const obj = {
                    nodeName,
                    rank
                  };
                  this.mpiData.push(obj);
                });
              } else if ('open_mp_param' in resp.data) { // openmp采集类型
                mpiEnvDirStatus = [ {
                    key: this.i18n.hpc.mission_create.openMpParams,
                    text: resp.data.open_mp_param || '--',
                    requier: '',
                  }];
              }
              this.configList = [
                {
                  key: this.i18n.task_name,
                  text: nodeData.taskname,
                  requier: ''
                },
                ...appOrPidConfig,
                {
                  key: this.i18n.sys.duration,
                  text: resp.data.duration,
                  requier: ''
                },
                {
                  key: this.i18n.sys.type,
                  text: this.presetTypeDict.get(this.type as HpcPresetType) || '--',
                  requier: ''
                },
                ...mpiEnvDirStatus
              ];
              this.returnConfigInfo.emit(resp);
            } else if (analysisType === 'memory_diagnostic') { // 诊断调试
              this.returnConfigInfo.emit({
                diagnosticType: nodeData.diagnosticType
              });
              let appOrPidConfig: any = [];
              const isLaunch = resp.data.analysisTarget === 'Launch Application';

              if (isLaunch) {
                appOrPidConfig = [
                  {
                    key: this.i18n.common_term_task_crate_app_path,
                    text: nodeData.appDir || '--',
                    requier: '',
                  },
                  {
                    key: this.i18n.mission_modal.cProcess.app_params,
                    text: nodeData.appParameters || '--',
                    requier: '',
                  }
                ];
              } else { // Attach 模式
                appOrPidConfig = [
                  {
                    key: this.i18n.mission_create.process_alias,
                    text: nodeData.process_name || '--',
                    requier: '',
                  },
                  {
                    key: 'PID',
                    text: nodeData.process_pid || '--',
                    requier: '',
                  }
                ];
              }
              if (this.status === 'Completed') {
                const commonInfo = allNodeData[0].commonInfo;
                this.timeData = [
                  {
                    key: this.i18n.startTime,
                    text: commonInfo.start_time || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.endTime,
                    text: commonInfo.end_time || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.dataSize,
                    text: commonInfo.size ? Util.fixThouSeparator(commonInfo.size.replace(/MB/, '')) : '--',
                    requier: ''
                  }
                ];
              } else {
                this.timeData = [
                  {
                    key: this.i18n.startTime,
                    text: '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.endTime,
                    text: '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.dataSize,
                    text: '--',
                    requier: ''
                  }
                ];
              }
              const diagnosticType = nodeData.diagnosticType.map((item: string) => {
                switch (item) {
                  case 'mem_leak':
                    return this.i18n.diagnostic.taskParams.memory_leakage;
                  case 'mem_consume':
                    return this.i18n.diagnostic.taskParams.memory_consumption;
                  case 'mem_exception':
                    return this.i18n.diagnostic.taskParams.memory_abnormal;
                  case 'oom':
                    return 'OOM';
                  default: return '';
                }
              }).join(',');
              let collectStack = '';
              if (nodeData.collectStack === false) {
                collectStack = this.i18n.sys_cof.sum.close;
              } else if (nodeData.collectStack === true) {
                collectStack = this.i18n.sys_cof.sum.open;
              } else {
                collectStack = '--';
              }
              let stopException = '';
              if (nodeData.stopException === false) {
                stopException = this.i18n.sys_cof.sum.close;
              } else if (nodeData.stopException === true) {
                stopException = this.i18n.sys_cof.sum.open;
              } else {
                stopException = '--';
              }
              const interval: any[] = [];
              if (nodeData.diagnosticType.includes('mem_consume')) {
                interval.push({
                  key: this.i18n.diagnostic.taskParams.interval,
                  text: nodeData.interval || '--',
                  requier: ''
                });
              }
              const isException = nodeData.diagnosticType.includes('mem_exception');
              this.configList = [
                {
                  key: this.i18n.task_name,
                  text: resp.data.taskName,
                  requier: ''
                },
                ...appOrPidConfig,
                {
                  key: this.i18n.diagnostic.taskParams.content_diagnose,
                  text: diagnosticType,
                  requier: ''
                },
                {
                  key: !isException ? this.i18n.diagnostic.taskParams.assemblyLocation : '',
                  text: nodeData.assemblyLocation || '--',
                  requier: ''
                },
                {
                  key: this.i18n.diagnostic.taskParams.sourceLocation,
                  text: nodeData.sourceLocation || '--',
                  requier: ''
                },
                {
                  key: !isException ? this.i18n.diagnostic.taskParams.samplingDelay : '',
                  text: nodeData.samplingDelay,
                  requier: '',
                  display: isLaunch ? 'inline-block' : 'none'
                },
                {
                  key: !isException ? this.i18n.diagnostic.taskParams.duration : '',
                  text: nodeData.duration || '--',
                  requier: ''
                },
                ...interval,
                {
                  key: isException ? this.i18n.diagnostic.taskParams.stopException : '',
                  text: stopException,
                  requier: ''
                },
                {
                  key: !isException ? this.i18n.diagnostic.taskParams.collectStack : '',
                  text: collectStack,
                  requier: ''
                },
                {
                  key: this.i18n.diagnostic.taskParams.collectSize,
                  text: nodeData.collectSize || '--',
                  requier: ''
                },
                ...this.timeData
              ];
            }

            // 公共 info 部分
            analysisTarget = this.getAnalysisTarget({ taskInfo: nodeData });
            if (analysisType === 'memory_diagnostic') {
              analysisTarget = resp.data.analysisTarget;
            }
            const info = {
              nickName: { // 节点别名
                key: this.i18n.common_term_another_nodename,
                text: nodeNickName,
                requier: ''
              },
              target: { // 分析类型
                key: this.i18n.common_term_task_analysis_type,
                text: analysisTypesDir[analysisType],
                requier: ''
              },
              diagnoseObj: { // 诊断对象(diagnose)
                key: this.i18n.diagnostic.taskParams.diagnosticTarget,
                text: this.i18n.diagnostic.taskParams.ram,
                requier: ''
              },
              sys: { // 分析对象，系统
                key: this.i18n.mission_create.analysisTarget,
                text: this.i18n.common_term_projiect_task_system,
                requier: ''
              },
              app: {  // 分析对象，应用
                key: this.i18n.mission_create.analysisTarget,
                text: this.i18n.common_term_task_crate_path,
                requier: ''
              },
              mode: { // 当分析类型为‘应用’时，有分析模式
                key: this.i18n.mission_create.mode,
                text: analysisTarget,
                requier: ''
              }
            };
            configInfo.push(info.nickName);
            configInfo.push(this.isDiagnose ? info.diagnoseObj : info.target);
            if (!analysisTarget || analysisTarget === 'Profile System') {
              configInfo.push(info.sys);
            } else {
              if (analysisType !== 'memory_diagnostic') {
                configInfo.push(info.app);
              }
              configInfo.push(info.mode);
            }
            for (let i = configInfo.length - 1; i >= 0; i--) {
              this.configList.splice(1, 0, configInfo[i]);
            }
          } else { // 联动分析任务信息
            analysisType = 'task_contrast';
            taskStatus = resp.data.taskStatus;
            this.returnConfigInfo.emit({});
            this.configList = [
              {
                key: this.i18n.task_name,
                text: resp.data.taskName,
                requier: ''
              },
              {
                key: this.i18n.common_term_task_type,
                text: analysisTypesDir[resp.data.analysisType] || '--',
                requier: ''
              },
              {
                key: this.i18n.linkage.taskCreateTime,
                text: resp.data.timeCreated,
                requier: ''
              },
            ];
            this.linkageData.data = resp.data.taskDetail;
          }

          // TODO:任务信息中新增任务状态和失败原因
          let taskInfo: TaskInfoItemType[] = [];
          if (taskStatus === 'Completed' || taskStatus === 'Cancelled') {
            taskInfo = [{
              key: this.i18n.common_term_task_status,
              text: this.failtoText(taskStatus) || '--',
              requier: '',
              status: taskStatus,
              taskcode: '',
            }];
          } else {
            taskInfo = [
              {
                key: this.i18n.common_term_task_status,
                text: this.failtoText(taskStatus),
                requier: '',
                status: taskStatus,
                taskcode: statusCode || '--',
              },
            ];
          }
          // 任务时间信息部分
          if (analysisType !== 'microarchitecture'
            && analysisType !== 'miss_event'
            && analysisType !== 'memory_diagnostic'
            && analysisType !== 'task_contrast'
          ) {
            if (this.status === 'Completed') {
              this.getCommonTime();
            } else {
              this.timeData = [
                {
                  key: this.i18n.startTime,
                  text: '--',
                  requier: ''
                },
                {
                  key: this.i18n.endTime,
                  text: '--',
                  requier: ''
                },
                {
                  key: this.i18n.dataSize,
                  text: '--',
                  requier: ''
                }
              ];
              this.configList = this.configList.concat(this.timeData);
            }
          }

          // 插入任务状态信息
          this.configList.forEach((element, index) => {
            if ((element.key === this.i18n.common_term_another_nodename) ||
              (analysisType === 'task_contrast' && element.key === this.i18n.common_term_task_type)) {
              this.configList.splice((index + 1), 0, taskInfo[0]);
            }
          });

          // TODO:大数据和分布式路径信息以及数据库配置信息
          let pathInfo: TaskInfoItemType[] = [];
          if ('sceneSolution' in nodeData) {
            const sceneSolution = nodeData.sceneSolution;
            if (sceneSolution !== AnalysisScene.Database) {
              pathInfo = [{
                key: sceneSolution === 0 ? this.i18n.common_term_distributed_path : this.i18n.common_term_bigdata,
                text: nodeData.configDir || '--',
                requier: '',
                status: '',
                taskcode: '',
              }];
              this.configList.forEach((el, index) => {
                if (el.key === this.i18n.mission_create.analysisTarget) {
                  this.configList.splice((index + 1), 0, pathInfo[0]);
                }
              });
            } else {
              const databaseConfigs: TaskInfoItemType[] = [
                {
                  key: this.i18n.sys.scenes_tracing,
                  text: nodeData.traceSwitch === true ? this.i18n.status_Yes : this.i18n.status_No,
                  requier: '',
                  status: '',
                  taskcode: '',
                },
                {
                  key: this.i18n.sys.tracing_event,
                  text: nodeData.events || '--',
                  requier: '',
                  status: '',
                  taskcode: '',
                },
                {
                  key: this.i18n.databaseConfig.ip,
                  text: nodeData.sqlIp,
                  requier: '',
                  status: '',
                  taskcode: '',
                },
                {
                  key: this.i18n.databaseConfig.port,
                  text: nodeData.sqlPort || '--',
                  requier: '',
                  status: '',
                  taskcode: '',
                },
              ];
              const insertIndex = this.configList.findIndex(
                item => (item.key === this.i18n.mission_create.analysisTarget)
              );
              this.configList.splice((insertIndex + 1), 0, ...databaseConfigs);
            }
          }
          // TODO:采集Top活跃进程信息
          let topInfo: TaskInfoItemType[] = [];
          if ('topCheck' in nodeData) {
            topInfo = [{
              key: this.i18n.sys.scenes_top,
              text: nodeData.topCheck === true ? this.i18n.status_Yes : this.i18n.status_No,
              requier: '',
              status: '',
              taskcode: '',
            }];
            this.configList.forEach((el, index) => {
              if (el.key === this.i18n.mission_create.analysisTarget) {
                this.configList.splice((index + 1), 0, topInfo[0]);
              }
            });
          }
        }
      })
      .catch((error: any) => {
        this.obtainingTaskInfo = false;
      });
  }
  // 状态小圆点
  public statusFormat(status: any) {
    let iconColor = '';
    switch (status) {
      case 'Completed':
        iconColor = 'analyzing-icon';
        break;
      case 'Failed':
        iconColor = 'failed-icon';
        break;
      case 'Cancelled':
        iconColor = 'failed-icon';
        break;
      default:
        break;
    }
    return iconColor;
  }

  // 失败原因转换文字
  public failtoText(status: any) {
    let statusText;
    switch (status) {
      case 'Completed':
        statusText = this.i18n.status_Completed;
        break;
      case 'Failed':
        statusText = this.i18n.status_Failed;
        break;
      case 'Cancelled':
        statusText = this.i18n.status_Cancelled;
        break;
      default:
        break;
    }
    return statusText;
  }
  public getInterval(data: any) {
    if (data) {
      if (data === '0.71') {
        return '710';
      } else {
        return data;
      }

    } else {
      return '--';
    }
  }
  public isInterval(text: any) {
    if (text.includes(this.i18n.common_term_task_crate_interval_ms) || text.includes(this.i18n.falsesharing.filesize)) {
      return true;
    } else {
      return false;
    }
  }
  public getAnalysisTarget({ taskInfo }: any) {
    const missAnalysisTarget: any = {
      sys: 'Profile System',
      app: 'Launch Application',
      pid: 'Attach to Process'
    };
    if (taskInfo['analysis-type'] === 'miss_event') {
      return missAnalysisTarget[taskInfo.task_param.target];
    } else {
      return taskInfo['analysis-target'] || taskInfo.analysisTarget;
    }
  }

  public getCommonTime() {
    this.obtainingTaskInfo = true;
    this.Axios.axios.get('/tasks/' + encodeURIComponent(this.taskid) + '/common/common-info/?node-id=' + this.nodeid, {
      headers: {
        showLoading: false,
      }
    })
      .then((resp: any) => {
        if (resp) {
          this.timeData = [
            {
              key: this.i18n.startTime,
              text: resp.data.start_time || '--',
              requier: ''
            },
            {
              key: this.i18n.endTime,
              text: resp.data.end_time || '--',
              requier: ''
            },
            {
              key: this.i18n.dataSize,
              text: Util.fixThouSeparator(resp.data.size.replace(/MB/, '') || '--'),
              requier: ''
            }
          ];
          this.configList = this.configList.concat(this.timeData);
        }

      })
      .catch((error: any) => {
        this.timeData = [
          {
            key: this.i18n.startTime,
            text: '--',
            requier: ''
          },
          {
            key: this.i18n.endTime,
            text: '--',
            requier: ''
          },
          {
            key: this.i18n.dataSize,
            text: '--',
            requier: ''
          }
        ];
        this.configList = this.configList.concat(this.timeData);
      })
      .finally(() => {
        this.obtainingTaskInfo = false;
      });
  }

  public showFailReason(arrStatus: any, taskcode: any) {
    if (!arrStatus) {
      this.arrStatus = true;
      if (
        taskcode.indexOf('Kunpeng Compute github repo') > -1
        || taskcode.indexOf('Kunpeng Compute Github repo') > -1
      ) {
        setTimeout(() => {
          const taskCodeSecurity = this.domSanitizer.sanitize(SecurityContext.HTML, taskcode);
          let url = '';
          let dom = '';
          if (taskcode.indexOf('Kunpeng Compute github repo') > -1) {
            url = '<a href=' + this.kunpengcomputeDevkitdriverGithubUrl + ' target="_bank">github repo</a>';
            dom = '<div style="font-size:14px;color: #222;overflow:auto;">'
              + taskCodeSecurity.replace('github repo', url) + '</div>';
          } else {
            url = '<a href=' + this.kunpengcomputeDevkitdriverGithubUrl + ' target="_bank">Github repo</a>';
            dom = '<div style="font-size:14px;color: #222;overflow:auto;">'
              + taskCodeSecurity.replace('Github repo', url) + '</div>';
          }
          const title = '<div style="font-size:14px;color: #616161;margin-bottom: 10px;">' +
           this.i18n.common_term_task_fail_reason + ':</div>';
          dom = title + dom;
          const reasonBox = this.el.nativeElement.querySelector('.reasonBox');
          reasonBox.innerHTML = dom;
        }, 0);
      }
      if (this.analysisType === 'hpc-analysis' && taskcode.indexOf(this.i18n.user_guide_link) > -1) {
        setTimeout(() => {
            let url = '';
            let dom = '';
            url = `<a href="${this.hpcUserGuideUrl}" target="_bank">${this.i18n.user_guide_link}</a>`;
            dom = `<div style="font-size:14px;color: #222;overflow:auto;">
            ${taskcode.replace(this.i18n.user_guide_link, url)}</div>`;
            const title = `<div style="font-size:14px;color: #616161;margin-bottom: 10px;">
            ${this.i18n.common_term_task_fail_reason}:</div>`;
            dom = title + dom;
            const reasonBox = this.el.nativeElement.querySelector('.reasonBox');
            reasonBox.innerHTML = dom;
        }, 0);
    }
      $(this.el.nativeElement.querySelector('.arrow-up')).css({ background:
        'url("./assets/img/header/arr-down-8-copy.svg") center no-repeat', transform: 'rotateX(180deg)' });
    } else {
      this.arrStatus = false;
      $(this.el.nativeElement.querySelector('.arrow-up')).css({
        background:
          'url("./assets/img/header/arr-down-8.svg") center no-repeat', transform: 'rotateX(360deg)'
      });
    }
  }
}
