import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { MytipService } from '../../service/mytip.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

import { BaseForm } from '../taskParams/BaseForm';
import { MemAnalysisModeForm } from '../taskParams/modules/MemAnalysisModeForm';
import { MemAccessForm } from '../taskParams/modules/MemAccessForm';
import { MissEventForm } from '../taskParams/modules/MissEventForm';
import { FalseSharingForm } from '../taskParams/modules/FalseSharingForm';
import { AllParams } from '../taskParams/AllParams';
import { TaskDetailMode } from '../domain';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-mission-templates-all',
  templateUrl: './mission-templates-all.component.html',
  styleUrls: ['./mission-templates-all.component.scss']
})
export class MissionTemplatesAllComponent implements OnInit {
  constructor(
    public i18nService: I18nService,
    private Axios: AxiosService,
    public mytip: MytipService,
    private tiMessage: MessageModalService,
    private urlService: UrlService
  ) {
    this.i18n = this.i18nService.I18n();
    this.url = this.urlService.Url();
    this.popColumnNum = this.isDiagnose ? 2 : 3;
    const diagnoseColumn = [
      {
        title: this.i18n.mission_modal.missionName,
        sortKey: 'taskName',
        width: '32%',
      },
      {
        title: this.i18n.diagnostic.taskParams.diagnosticTarget,
        sortKey: 'analysisTarget',
        width: '32%'
      },
      {
        title: this.i18n.preTable.action,
        sortKey: 'operate',
        width: '32%'
      },
    ];
    this.columns = this.isDiagnose ? diagnoseColumn : [
      {
        title: this.i18n.mission_modal.missionName,
        sortKey: 'taskName', // 设置排序时按照源数据中的哪一个属性进行排序，
        width: '21%',
      },
      {
        title: this.i18n.mission_create.analysisTarget,
        width: '21%',
        key: 'analysisTarget', // 该列的 headfilter 要过滤的字段
        selected: [// 该列的 headfilter 下拉选择项
        ],
        options: [{ // 该列的 headfilter 下拉选择项
          id: this.i18n.common_term_projiect_task_system,
          text: this.i18n.common_term_projiect_task_system,
        }, {
          id: this.i18n.common_term_task_crate_path,
          text: this.i18n.common_term_task_crate_path,
        }],
      },
      {
        title: this.i18n.common_term_task_analysis_type,
        width: '27%',
        key: 'analysisType', // 该列的 headfilter 要过滤的字段
        selected: [],
        options: [{ // 该列的 headfilter 下拉选择项
          id: 'C/C++ Program',
          text: this.i18n.mission_create.cPlusPlus,
        }, {
          id: 'java-mixed-mode',
          text: this.i18n.mission_create.java,
        }, {
          id: 'process-thread-analysis',
          text: this.i18n.mission_modal.processAnalysis,
        }, {
          id: 'system',
          text: this.i18n.sys_summary.cpupackage_tabel.sysPro,
        }, {
          id: 'resource_schedule',
          text: this.i18n.mission_create.resSchedule,
        }, {
          id: 'system_lock',
          text: this.i18n.mission_modal.syslockAnalysis,
        }, {
          id: 'mem_access',
          text: this.i18n.mission_modal.memAccessAnalysis,
        }, {
          id: 'microarchitecture',
          text: this.i18n.micarch.selct_title,
        }, {
          id: 'ioperformance',
          text: this.i18n.mission_create.io,
        }, {
          id: 'hpc_analysis',
          text: this.i18n.mission_create.hpc_analysis,
        }],
      },
      {
        title: this.i18n.preTable.action,
        sortKey: 'operate',
        width: '21%'
      },
    ];
    this.taskNameObj = [
      {
        type: 'C/C++ Program',
        name: this.i18n.mission_create.cPlusPlus,
      },
      {
        type: 'java-mixed-mode',
        name: this.i18n.mission_create.java,
      },
      {
        type: 'process-thread-analysis',
        name: this.i18n.mission_modal.processAnalysis,
        cpu: this.i18n.sys.cpu,
        mem: this.i18n.sys.mem,
        context: this.i18n.process.context,
        disk: this.i18n.sys.disk
      },
      {
        type: 'system',
        name: this.i18n.sys_summary.cpupackage_tabel.sysPro,
        net: this.i18n.sys.net,
        cpu: this.i18n.sys.cpu,
        mem: this.i18n.sys.mem,
        disk: this.i18n.sys.disk
      },
      {
        type: 'resource_schedule',
        name: this.i18n.mission_create.resSchedule,
      },
      {
        type: 'system_lock',
        name: this.i18n.mission_modal.syslockAnalysis
      },
      {
        type: 'microarchitecture',
        name: this.i18n.micarch.selct_title,
      },
      {
        type: 'ioperformance',
        name: this.i18n.mission_create.io,
      },
      {
        type: 'mem_access_analysis',
        typeList: ['mem_access', 'miss_event', 'falsesharing'],
        name: this.i18n.mission_modal.memAccessAnalysis,
        cache_access: this.i18n.ddr.types.cache_access,
        ddr_access: this.i18n.ddr.types.ddr_access
      },
      {
        type: 'hpc_analysis',
        name: this.i18n.mission_create.hpc_analysis,
      },
      {
        type: 'memory_diagnostic',
        name: this.i18n.diagnostic.analysis_type,
      },
      {
        type: 'netio_diagnostic',
        name: this.i18n.network_diagnositic.analysis_type,
      },
      {
        type: 'storageio_diagnostic',
        name: this.i18n.storageIo.analysis_type,
      }
    ];
  }

  @ViewChild('missionModal') missionModal: any;
  @ViewChild('multipleDeleteMask') multipleDeleteMask: any;
  @Output() private outer = new EventEmitter<any>();
  @Input() missName: string;
  public url: any;
  public i18n: any;
  public templateAll = false;
  public ifShow = false;
  public checkedListOk: Array<TiTableRowData> = [];
  public displayedOk: Array<TiTableRowData> = [];
  public srcDataOk: TiTableSrcData;
  public displayed: Array<TiTableRowData> = [];
  public checkedList: Array<TiTableRowData> = []; // 默认选中项
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];
  public completeData: any = []; // 处理好的完整数据
  public taskNameObj: any = [];
  public nodataTips = '';
  // 保存任务列表长度
  public totalNumber = 0;
  public currentPage = 1;
  public pageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 30, 40, 50],
    size: 10,
  };

  public imgSrc: any;  // 模板列表种类图标路径
  public funcSrc: any = './assets/img/template/function.png';
  public precessSrc: any = './assets/img/template/precess.png';
  public systemSrc: any = './assets/img/template/system.png';
  public nodata: any = './assets/img/projects/nodata.png';
  public data: any = {    // 数据获取保存
    templateList: []
  };
  public missionDetail: any; // 任务模板详细条目
  public missionName: string; // 模板前缀
  public enMissSortArr: any; // 种类名称国际化
  public missArr: any = ['C/C++ Program', 'java-mixed-mode', 'process-thread-analysis', 'system',
    'system_config', 'resource_schedule', 'system_lock',
    'mem_access', 'microarchitecture', 'miss_event', 'ioperformance', 'hpc_analysis'];
  public cPs = 'Profile System';
  public cAtp = 'Attach to Process';
  public cLa = 'Launch Application';

  public collapsed = true;
  // 处理模板分析类型
  public taskType: any = {};
  public simplingArr = [
    { id: 'badSpeculation', text: 'Bad Speculation', tip: 'testtest' },
    { id: 'frontEndBound', text: 'Front-End Bound', tip: 'testtest' },
    { id: 'resourceBound', text: 'Back-End Bound->Resource Bound', tip: 'testtest' },
    { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: 'testtest' },
    { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: 'testtest' },
  ];
  public isLoading: any = false;
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  public popColumnNum = 3;
  ngOnInit() {
    this.nodataTips = this.i18n.loading;
    this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.srcDataOk = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    // 详细任务条目名称
    this.missionDetail = [
      [
        [
          // cPs
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_modal.cProcess.duration },
          {
            calcTitle: (obj: any) => `${this.i18n.common_term_task_crate_interval_ms} (${obj.interval === '0.71' ?
              this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms})`
          },
          { title: this.i18n.ddr.samplingRange },
          { title: this.i18n.ddr.cpuToBeSamples },
          { title: this.i18n.mission_modal.cProcess.file_path },
          { title: this.i18n.mission_modal.cProcess.source_path },
          { title: this.i18n.mission_create.kcore },
          {
            title: this.i18n.falsesharing.filesize
              + this.i18n.ddr.leftParenthesis + 'MiB' + this.i18n.ddr.rightParenthesis
          },
        ],
        [
          // cAtp
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_create.process_alias },
          { title: this.i18n.mission_modal.cProcess.pid },
          { title: this.i18n.mission_modal.cProcess.duration },
          {
            calcTitle: (obj: any) => `${this.i18n.common_term_task_crate_interval_ms} (${obj.interval === '0.71' ?
              this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms})`
          },
          { title: this.i18n.ddr.samplingRange },
          { title: this.i18n.mission_modal.cProcess.file_path },
          { title: this.i18n.mission_modal.cProcess.source_path },
          { title: this.i18n.mission_create.kcore },
          {
            title: this.i18n.falsesharing.filesize
              + this.i18n.ddr.leftParenthesis + 'MiB' + this.i18n.ddr.rightParenthesis
          },
        ],
        [
          // cLa
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_modal.cProcess.app_path },
          { title: this.i18n.mission_modal.cProcess.app_params },
          {
            calcTitle: (obj: any) => `${this.i18n.common_term_task_crate_interval_ms} (${obj.interval === '0.71' ?
              this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms})`
          },
          { title: this.i18n.ddr.samplingRange },
          { title: this.i18n.mission_modal.cProcess.file_path },
          { title: this.i18n.mission_modal.cProcess.source_path },
          { title: this.i18n.mission_create.kcore },
          {
            title: this.i18n.falsesharing.filesize
              + this.i18n.ddr.leftParenthesis + 'MiB' + this.i18n.ddr.rightParenthesis
          },
        ],
      ],
      [
        [
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_modal.sysSource.pid },
          { title: this.i18n.mission_create.process_alias },
          { title: this.i18n.mission_modal.javaMix.duration },
          {
            calcTitle: (obj: any) => `${this.i18n.common_term_task_crate_interval_ms} (${obj.interval === '0.71' ?
              this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms})`
          },
          { title: this.i18n.ddr.samplingRange },
          { title: this.i18n.mission_modal.javaMix.java_path },
          { title: this.i18n.mission_create.kcore },
          {
            title: this.i18n.falsesharing.filesize
              + this.i18n.ddr.leftParenthesis + 'MiB' + this.i18n.ddr.rightParenthesis
          },
        ],
        [
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_modal.javaMix.application },
          { title: this.i18n.mission_modal.javaMix.app_params },
          {
            calcTitle: (obj: any) => `${this.i18n.common_term_task_crate_interval_ms} (${obj.interval === '0.71' ?
              this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms})`
          },
          { title: this.i18n.ddr.samplingRange },
          { title: this.i18n.mission_modal.javaMix.java_path },
          { title: this.i18n.mission_create.kcore },
          {
            title: this.i18n.falsesharing.filesize
              + this.i18n.ddr.leftParenthesis + 'MiB' + this.i18n.ddr.rightParenthesis
          },
        ],
      ],
      [
        { title: this.i18n.common_term_task_name },
        { title: this.i18n.mission_create.mode },
        { title: this.i18n.mission_modal.process.interval },
        { title: this.i18n.mission_modal.process.duration },
        { title: this.i18n.mission_modal.process.task_params },
        { title: this.i18n.mission_modal.process.pid },
        { title: this.i18n.mission_modal.process.straceAnalysis },
        { title: this.i18n.mission_modal.process.thread },
      ],
      [
        // ok
        { title: this.i18n.common_term_task_name },
        { title: this.i18n.mission_modal.panoramic.interval },
        { title: this.i18n.mission_modal.panoramic.duration },
        { dssTitle: this.i18n.sys.scenes_dds, bigDataTitle: this.i18n.sys.scenes_bigData },
        { title: this.i18n.sys.scenes_top },
      ],
      [
        // ok
        { title: this.i18n.mission_modal.sysConfig.task_params },
      ],
      [
        [
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_modal.sysSource.duration },
          { title: this.i18n.mission_modal.sysSource.file_path },
          { title: this.i18n.mission_create.collectCallStack },
          {
            title: this.i18n.falsesharing.filesize
              + ' '
              + this.i18n.ddr.leftParenthesis
              + 'MiB'
              + this.i18n.ddr.rightParenthesis,
          },
        ],
        [
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_modal.sysSource.pid },
          { title: this.i18n.mission_create.process_alias },
          { title: this.i18n.mission_modal.sysSource.duration },
          { title: this.i18n.mission_modal.sysSource.file_path },
          { title: this.i18n.mission_create.collectCallStack },
          {
            title: this.i18n.falsesharing.filesize
              + ' '
              + this.i18n.ddr.leftParenthesis
              + 'MiB'
              + this.i18n.ddr.rightParenthesis,
          },
        ],
        [
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_modal.cProcess.app_path },
          { title: this.i18n.mission_modal.sysSource.app_params },
          { title: this.i18n.mission_modal.sysSource.file_path },
          { title: this.i18n.mission_create.collectCallStack },
          {
            title: this.i18n.falsesharing.filesize
              + ' '
              + this.i18n.ddr.leftParenthesis
              + 'MiB'
              + this.i18n.ddr.rightParenthesis,
          },
        ]
      ],
      [
        [
          // mPs
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_modal.syslock.duration },
          {
            calcTitle: (obj: any) => `${this.i18n.common_term_task_crate_interval_ms} (${obj.interval === '0.71' ?
              this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms})`
          },
          { title: this.i18n.micarch.label.typeItem },
          { title: this.i18n.lock.form.functions_analysis },
          { title: this.i18n.mission_modal.lockSummary.filname },
          { title: this.i18n.mission_modal.lockSummary.source_path },
          { title: this.i18n.mission_create.kcore },
          {
            title: this.i18n.mission_create.collection_size
          },
        ],
        [
          // mAtp
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_modal.syslock.pid },
          { title: this.i18n.mission_create.process_alias },
          { title: this.i18n.mission_modal.syslock.duration },
          {
            calcTitle: (obj: any) => `${this.i18n.common_term_task_crate_interval_ms} (${obj.interval === '0.71' ?
              this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms})`
          },
          { title: this.i18n.micarch.label.typeItem },
          { title: this.i18n.lock.form.functions_analysis },
          { title: this.i18n.mission_modal.lockSummary.filname },
          { title: this.i18n.mission_modal.lockSummary.source_path },
          { title: this.i18n.mission_create.kcore },
          {
            title: this.i18n.mission_create.collection_size
          },
        ],
        [
          // mLa
          { title: this.i18n.common_term_task_name },
          { title: this.i18n.mission_create.mode },
          { title: this.i18n.mission_modal.syslock.application },
          { title: this.i18n.mission_modal.syslock.app_params },
          {
            calcTitle: (obj: any) => `${this.i18n.common_term_task_crate_interval_ms} (${obj.interval === '0.71' ?
              this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms})`
          },
          { title: this.i18n.micarch.label.typeItem },
          { title: this.i18n.lock.form.functions_analysis },
          { title: this.i18n.mission_modal.lockSummary.filname },
          { title: this.i18n.mission_modal.lockSummary.source_path },
          { title: this.i18n.mission_create.kcore },
          {
            title: this.i18n.mission_create.collection_size
          },
        ],
      ],
      [
        { title: this.i18n.common_term_task_name },
        { title: this.i18n.mission_create.mode },
        { title: this.i18n.mission_modal.memAccess.interval },
        { title: this.i18n.mission_modal.memAccess.duration },
        { title: this.i18n.mission_modal.memAccess.task_params },
      ]
    ];
    this.enMissSortArr = [
      this.i18n.mission_modal.cProgramAnalysis,
      this.i18n.mission_modal.processAnalysis,
      this.i18n.mission_modal.sysPowerAllAnalysis,
      this.i18n.mission_modal.sysConfigAnalysis,
      this.i18n.mission_modal.resourceAnalysis,
      this.i18n.mission_modal.syslockAnalysis,
      this.i18n.mission_modal.memAccessAnalysis,
      this.i18n.micarch.selct_title,
      this.i18n.mission_create.missEvent
    ],
      this.taskType = {
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
    this.open('all');
    this.columns.forEach((val: any) => {
      if (Object.prototype.hasOwnProperty.call(val, 'options')) {
        val.selected = [...val.options];
      }
    });
  }
  // 筛选数据
  public onMyChange(val: any, i: any) {
    const that = this;
    this.srcData.data = this.completeData.filter((item: any) => {
      const t1 = that.ifTrue(item['analysis-type'], that.columns[2].selected);
      const t2 = that.ifTrue(item.analysisTargetText, that.columns[1].selected);
      const test = t1 && t2;
      return test;
    });
    this.totalNumber = this.srcData.data.length;
    // 更新选中列表
    const checkedListAfter = this.srcData.data.filter((el: any) => {
      const isThat = that.checkedList.find(item => {
        return item.taskName === el.taskName;
      });
      return isThat;
    });
    this.checkedList = checkedListAfter;
    if (this.totalNumber === 0) {
      this.nodataTips = this.i18n.common_term_task_nodata2;
    }
  }
  public ifTrue(item: any, data: any) {
    let val = false;
    data.forEach((ele: any) => {
      if (item === ele.id) {
        val = true;
      }
      if ((item === 'miss_event' || item === 'mem_access' || item === 'falsesharing') && ele.id === 'mem_access') {
        val = true;
      }
    });
    return val;
  }
  public trackByFn(index: number, item: any): number {
    return item.id;
  }
  public isInterval(text: any) {
    if (text.includes(this.i18n.common_term_task_crate_interval_ms) || text.includes(this.i18n.ddr.collectionDelay)) {
      return true;
    } else {
      return false;
    }
  }
  // 多选删除
  public multipleDelete() {
    if (this.checkedList.length === 0) {
      return;
    }
    this.srcDataOk.data = JSON.parse(JSON.stringify(this.checkedList));
    this.checkedListOk = [...this.srcDataOk.data];
    this.multipleDeleteMask.Open();
  }
  // 同步模态框选项
  public toggleSelect() {
    this.checkedList = this.srcData.data.filter((val: any) => {
      return this.checkedListOk.find(el => {
        return val.templateName === el.templateName;
      });
    });
  }
  // 关闭多选删除弹框
  public closeDelete() {
    this.multipleDeleteMask.Close();
    this.checkedListOk = [];
  }
  // 确认多选删除
  public multipleDeleteOk() {
    if (this.checkedListOk.length === 0) {
      return;
    }
    const taskIdArr = this.checkedListOk.map((val: any) => {
      return val.id;
    });
    const self = this;
    let params: any;
    if (this.isDiagnose) {
      params = {
        data: { templateIds: taskIdArr }
      };
    } else {
      params = {
        data: { template_ids: taskIdArr }
      };
    }
    this.Axios.axios.delete(`${this.url.toolTask}templates/batch-delete/`, params)
      .then((res: any) => {
        self.mytip.alertInfo({ type: 'success', content: self.i18n.tip_msg.delete_ok, time: 3500 });
        this.closeDelete();
        this.getData();
      });
  }
  // 展开详情
  public beforeToggle(row: TiTableRowData, i: any): void {
    // 展开时
    if (!row.showDetails) {
      row.showDetails = !row.showDetails;
    } else {
      // 收起时直接收起
      row.showDetails = !row.showDetails;
    }
  }
  public open(type: any) {
    this.missName = type;
    this.missionName = '';

    if (this.missName === 'all') {
      this.getData();
    }
    this.ifShow = true;
  }

  // 删除指定模板
  public delete(item: any): any {

    let str1 = '';
    let str2 = '';
    const tem = document.getElementsByName('template');
    this.data.templateList.forEach((val: { isShow: boolean; }) => {
      val.isShow = true;
    });
    str1 = item.id;
    if (item['analysis-type'] === 'C/C++ Program') {
      str2 = 'c-cpp-program';
    } else {
      str2 = item['analysis-type'];
    }
    const self = this;
    this.tiMessage.open({
      type: 'warn',
      modalClass: 'delete-box',
      title: this.i18n.mission_modal.notice,
      content: this.i18n.mission_modal.noticeOne + ' ' + item.templateName + '?',
      close() {
        this.isLoading = true;
        self.Axios.axios.delete(`${self.url.toolTask}templates/${encodeURIComponent(str1)}/`,
          { headers: { showLoading: false } })
          .then((res: any) => {
            self.mytip.alertInfo({ type: 'success', content: self.i18n.tip_msg.delete_ok, time: 3500 });
            this.isLoading = false;
            self.getData();
          }).catch(() => {
            this.isLoading = false;
          });
      },
      okButton: {
        text: this.i18n.common_term_operate_ok,
        primary: false,
        autofocus: false
      },
      cancelButton: {
        text: this.i18n.common_term_operate_cancel,
        primary: true,
        autofocus: true
      }
    });
  }

  public handleTaskTarget(row: any) {
    const type = row['analysis-type'] ? 'analysis-type' : 'analysisType';
    if (row[type] === 'memory_diagnostic') {
      return this.i18n.diagnostic.taskParams.ram;
    }
    if (row[type] === 'netio_diagnostic') {
      return this.i18n.diagnostic.taskParams.networkIO;
    }
    if (row[type] === 'storageio_diagnostic') {
      return this.i18n.diagnostic.taskParams.storageIO;
    }
    const analysisTarget = this.getAnalysisTarget({ taskInfo: row });
    if (['Launch Application', 'Attach to Process'].includes(analysisTarget)) {
      return this.i18n.common_term_task_crate_path;
    } else {
      return this.i18n.common_term_projiect_task_system;
    }
  }
  // 任务类型
  public handleTaskType(row: any) {
    const type = row['analysis-type'] ? 'analysis-type' : 'analysisType';
    let returnValue = '--';
    if (this.taskNameObj != null) {
      Object.keys(this.taskNameObj).forEach(item => {
        const analysisType = this.taskNameObj[item];
        if (row[type] === analysisType.type || analysisType.typeList && analysisType.typeList.includes(row[type])) {
          returnValue = analysisType.name;
        }
      });
    }
    return returnValue;
  }
  public getTemplateName(row: any) {
    return row['template-name'] || row.templateName;
  }

  // 根据 taskInfo 返回 analysisTarget
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

  // 根据 taskInfo 返回分析类型
  public getAnalysisType({ taskInfo }: any) {
    return taskInfo['analysis-type'] || taskInfo.analysisType;
  }

  // 根据 template 计算出显示信息【目前只有访存分析在使用】
  public calcTemplateInfo(formEl: any, template: any) {
    const templateInfo: any = {};

    const parentFormEl = new MemAnalysisModeForm();
    parentFormEl.generateFormGroup();
    parentFormEl.customForm({ formEl: parentFormEl });

    const values = formEl.paramsToValues({ params: JSON.parse(JSON.stringify(template)) });
    const configList = [];

    parentFormEl.setValues({
      values,
      formEl: parentFormEl,
      type: 'text',
      i18n: this.i18n,
    });
    const parentFormElDisplayedElementList = parentFormEl.displayedElementList.filter(item => {
      return !['analysisObject', 'analysisType', 'switchState', 'user_name', 'password'].includes(item);
    });
    configList.push(...parentFormElDisplayedElementList.map(item => {
      const el = parentFormEl.form[item];

      return {
        key: el.label,
        text: [undefined, ''].includes(el.text) ? '--' : el.text,
        requier: '',
        order: el.order
      };
    }).sort((a, b) => a.order - b.order));

    if (formEl.setAnalysisObject) {
      formEl.setAnalysisObject(values.analysisObject === 'analysisObject_sys'
        ? 'analysisObject_sys' : values.analysisMode);
    }
    formEl.setValues({
      values,
      formEl,
      type: 'text',
      i18n: this.i18n
    });
    configList.push(...formEl.displayedElementList.map((item: any) => {
      const el = formEl.form[item];

      return {
        key: el.label,
        text: [undefined, ''].includes(el.text) ? '--' : el.text,
        requier: '',
        order: el.order
      };
    }).sort((a: any, b: any) => a.order - b.order));

    // 附加预约任务参数
    if (Object.prototype.hasOwnProperty.call(template, 'cycle')) {
      const scheduleParams = [
        { // 是否是周期
          key: this.i18n.preSwitch.colectMethods,
          text: template.cycle ? this.i18n.preSwitch.duraColect : this.i18n.preSwitch.onceColect,
          requier: ''
        }, {
          key: this.i18n.preSwitch.pointTime,
          text: template.targetTime,
          requier: ''
        }, {
          key: this.i18n.preSwitch.pointDuration,
          text: this.handleColectDate(template),
          requier: ''
        }
      ];
      configList.push(...scheduleParams);
    }

    templateInfo.configList = configList;

    // 添加节点参数
    if (formEl.hasNodeConfig) {
      const nodeEditLabelList = formEl.getNodeConfigKeys({
        analysisObject: values.analysisObject,
        analysisMode: values.analysisMode,
      });
      const nodeEditList = nodeEditLabelList.filter((item: string) => {
        return !['switchState', 'user_name', 'password'].includes(item);
      });
      templateInfo.panelList = template.nodeConfig.map((node: any, index: any) => {
        const nodeFormEL = new BaseForm();
        const allParamsClone = nodeFormEL.deepClone(new AllParams().allParams);

        nodeFormEL.displayOrder = nodeEditList;
        nodeFormEL.displayedElementList = nodeEditList;
        nodeEditList.forEach((key: any) => {
          nodeFormEL.form[key] = allParamsClone[key];
        });
        nodeFormEL.generateFormGroup();

        const nodeValues = formEl.paramsToValues({
          params: node.task_param,
        });

        nodeFormEL.setValues({
          values: nodeValues,
          formEl: nodeFormEL,
          type: 'text',
          i18n: this.i18n,
        });

        return nodeFormEL.displayedElementList.map(item => {
          const el = nodeFormEL.form[item];

          return {
            key: el.label,
            text: [undefined, ''].includes(el.text) ? '--' : el.text,
            requier: '',
            order: el.order
          };
        }).sort((a, b) => a.order - b.order);
      });
    }

    return templateInfo;
  }
  public getLockType(template: any) {
    // 锁与等待 采样范围
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
    const item = typeOptions.find((val: any) => {
      return val.id === template;
    });
    const typeItem = item ? item.label : '--';
    return typeItem;
  }
  public getCorJavaType(template: any) {
    // 锁与等待 采样范围
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
    const item = typeOptions.find((val: any) => {
      return val.id === template;
    });
    const typeItem = item ? item.label : '--';
    return typeItem;
  }
  public getMicarchType(data: any) {
    let samplingSpace = '';
    if (data === 'all') {
      samplingSpace = this.i18n.micarch.typeItem_all;
    } else if (data === 'user') {
      samplingSpace = this.i18n.micarch.typeItem_user;
    } else if (data === 'kernel') {
      samplingSpace = this.i18n.micarch.typeItem_kernel;
    } else {
      samplingSpace = '--';
    }
    return samplingSpace;
  }
  // 获取所有模板列表数据
  public getData(): void {
    this.checkedList = [];
    this.checkedListOk = [];
    this.nodataTips = this.i18n.loading;
    this.isLoading = true;
    this.Axios.axios.get(`${this.url.toolTask}templates/`, { headers: { showLoading: false } }).then((res: any) => {
      this.data.templateList = res.data['template-list'];
      this.data.templateList.forEach((item: any) => {
        const taskData = item;
        item.isShow = true;
        item.analysisTargetText = this.handleTaskTarget(item);
        item.analysisType = this.handleTaskType(item);
        item.detailTarget = TaskDetailMode.TEMPLATE_DETAIL; // 详情的展示模式
        item.templateName = this.getTemplateName(item);
        if (this.isDiagnose) {
          if (item.analysisType === this.taskNameObj[11].name) {
            item['analysis-type'] = 'netio_diagnostic';
          } else if (item.analysisType === this.taskNameObj[10].name){
            item['analysis-type'] = 'memory_diagnostic';
          } else if (item.analysisType === this.taskNameObj[12].name){
            item['analysis-type'] = 'storageio_diagnostic';
          }
        }
        const analysisType = this.getAnalysisType({ taskInfo: item });

        if (analysisType === 'mem_access') { // 访存统计分析
          const formEl: any = new MemAccessForm();
          formEl.generateFormGroup();

          const templateInfo = this.calcTemplateInfo(formEl, item);

          Object.assign(item, templateInfo);
        } else if (analysisType === 'miss_event') { // Miss事件统计
          const formEl: any = new MissEventForm();
          formEl.generateFormGroup();

          const templateInfo = this.calcTemplateInfo(formEl, item);

          Object.assign(item, templateInfo);
        } else if (analysisType === 'falsesharing') { // 伪共享分析
          const formEl: any = new FalseSharingForm(this.i18n);
          formEl.generateFormGroup();

          const templateInfo = this.calcTemplateInfo(formEl, item);

          Object.assign(item, templateInfo);
        } else if (analysisType === 'microarchitecture') {
          let simplingIndex = '';
          this.simplingArr.forEach((val: any) => {
            if (item.analysisIndex.indexOf(val.id) > -1) {
              simplingIndex = val.text;
            }
          });
          if (simplingIndex) {
            simplingIndex = simplingIndex;
          } else {
            simplingIndex = '--';
          }
          item.analysisIndex = simplingIndex;
        } else if (analysisType === 'process-thread-analysis') { // 进程/线程分析
          const templateInfo: any = {};
          let a = '';
          taskData.task_param.type.forEach((param: any, index: any) => {
            if (index < taskData.task_param.type.length - 1) {
              a += this.taskType[param] + this.i18n.sys.douhao;
            } else {
              a += this.taskType[param];
            }
          });
          let appOrPidConfig: any = [];
          let straceAnalysis: any = [];
          let reservation: any = [];
          switch (taskData['analysis-target']) {
            case 'Attach to Process':
              appOrPidConfig = [
                {
                  key: 'PID',
                  text: taskData.pid || '--',
                  requier: '',
                },
                {
                  key: this.i18n.mission_create.process_alias,
                  text: taskData.process_name || '--',
                  requier: '',
                }
              ];
              straceAnalysis = [
                {
                  key: this.i18n.process.label.trace,
                  text: taskData['strace-analysis'] === 'enable' ? this.i18n.process.enable : this.i18n.process.disable,
                  requier: ''
                },
              ];
              templateInfo.panelList = taskData.nodeConfig.map((param: any, index: any) => {
                return [
                  {
                    key: this.i18n.common_term_task_crate_pid,
                    text: param.task_param.pid || '--',
                    requier: ''
                  },
                  {
                    key: this.i18n.mission_create.process_alias,
                    text: param.task_param.process_name || '--',
                    requier: '',
                  }
                ];
              });
              break;
            case 'Launch Application':
              appOrPidConfig = [
                {
                  key: this.i18n.common_term_task_crate_app_path,
                  text: taskData['app-dir'] || '--',
                  requier: '',
                },
                {
                  key: this.i18n.mission_modal.cProcess.app_params,
                  text: taskData['app-parameters'] || '--',
                  requier: '',
                }
              ];
              straceAnalysis = [
                {
                  key: this.i18n.process.label.trace,
                  text: taskData['strace-analysis'] === 'enable' ? this.i18n.process.enable : this.i18n.process.disable,
                  requier: ''
                },
              ];
              templateInfo.panelList = taskData.nodeConfig.map((param: any, index: any) => {
                return [
                  {
                    key: this.i18n.common_term_task_crate_app_path,
                    text: param.task_param['app-dir'],
                    requier: ''
                  },
                  {
                    key: this.i18n.common_term_task_crate_parameters,
                    text: param.task_param['app-parameters'] || '--',
                    requier: '',
                  }
                ];
              });
              break;
            case 'Profile System':
              straceAnalysis = [];
              break;
            default: break;
          }
          if (taskData.cycle != null) {
            reservation = [{
              text: taskData.cycle ? this.i18n.preSwitch.duraColect : this.i18n.preSwitch.onceColect,
              key: this.i18n.storageIO.mission_create.collect_way,
              requier: '',
            },
            {
              text: taskData.targetTime,
              key: this.i18n.storageIO.mission_create.cellect_time,
              requier: '',
            },
            {
              text: taskData.cycle
                ? (taskData.cycleStart || '').replace(/-/g, '/') + '—' + (taskData.cycleStop || '').replace(/-/g, '/')
                : (taskData.appointment || '').replace(/-/g, '/'),
              key: this.i18n.storageIO.mission_create.cellect_date,
              requier: '',
            }
            ];
          }
          templateInfo.configList = [
            {
              key: this.i18n.task_name,
              text: taskData.taskname,
              requier: ''
            },
            {
              key: this.i18n.mission_create.mode,
              text: taskData['analysis-target'],
              requier: ''
            },
            ...appOrPidConfig,
            {
              key: this.i18n.sys.duration,
              text: taskData.duration,
              requier: ''
            },
            {
              key: this.i18n.sys.interval,
              text: taskData.interval,
              requier: ''
            },
            ...straceAnalysis,
            {
              key: this.i18n.sys.type,
              text: a,
              requier: '',
            },
            {
              key: this.i18n.process.tread,
              text: taskData.thread === 'enable' ? this.i18n.process.enable : this.i18n.process.disable,
              requier: ''
            },
            ...reservation,
          ];
          templateInfo.configList.push();

          Object.assign(item, templateInfo);
        }
      });
      this.completeData = JSON.parse(JSON.stringify(this.data.templateList));
      this.srcData.data = this.data.templateList;
      this.totalNumber = this.srcData.data.length;
      if (this.completeData.length === 0) {
        this.nodataTips = this.i18n.common_term_task_nodata2;
      }
      this.isLoading = false;
    })
      .catch((error: any) => {
        this.nodataTips = this.i18n.common_term_task_nodata2;
        this.isLoading = false;
      });
  }
  // 处理采集日期
  public handleColectDate(obj: any) {
    return obj.cycle ? (obj.cycleStart && obj.cycleStart ? obj.cycleStart.split('-').join('/') +
      '一' + obj.cycleStop.split('-').join('/') : '') : (obj.appointment ? obj.appointment.split('-').join('/') : '');
  }
  handleObj(val: any) {
    let arr = [];
    arr = val.type.map((item: any) => {
      return this.taskType[item];
    });
    return arr.join(',');
  }

  /**
   * 是否开启关闭转换
   */
  handleOpenClose(obj: any, type: any) {
    const val = obj[type];
    return !val ?
      '--' :
      val === 'enable' ?
        this.i18n.process.enable : this.i18n.process.disable;
  }
  public hasProperty(obj: any, key: any) {
    const bool = Object.prototype.hasOwnProperty.call(obj, key);
    return bool;
  }
}
