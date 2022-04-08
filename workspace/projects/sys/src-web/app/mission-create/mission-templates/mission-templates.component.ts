import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ɵConsole } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';

import { BaseForm } from '../taskParams/BaseForm';
import { MemAnalysisModeForm } from '../taskParams/modules/MemAnalysisModeForm';
import { MemAccessForm } from '../taskParams/modules/MemAccessForm';
import { MissEventForm } from '../taskParams/modules/MissEventForm';
import { FalseSharingForm } from '../taskParams/modules/FalseSharingForm';
import { AllParams } from '../taskParams/AllParams';
import { TaskDetailMode } from '../domain';
import { ImportTemplateService as MissionIoImportService } from '../mission-io/services/import-template.service';
import { MissionHpcImportService } from '../mission-hpc/serivices/mission-hpc-import.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-mission-templates',
  templateUrl: './mission-templates.component.html',
  styleUrls: ['./mission-templates.component.scss']
})
export class MissionTemplatesComponent implements OnInit {
  private url: any;
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    private ioImportService: MissionIoImportService,
    private hpcImportService: MissionHpcImportService,
    private urlService: UrlService
  ) {
    this.url = this.urlService.Url();
    this.i18n = this.i18nService.I18n();
    this.analysisTypesDir = [
      {
        name: this.i18n.mission_create.sysPro,
        type: 'system'
      },
      {
        name: this.i18n.mission_create.sysConfig,
        type: 'system_config'
      },
      {
        name: this.i18n.mission_create.resSchedule,
        type: 'resource_schedule'
      },
      {
        name: this.i18n.mission_create.structure,
        type: 'microarchitecture'
      },
      {
        name: this.i18n.mission_create.mem,
        type: 'mem_access'
      },
      {
        name: this.i18n.mission_create.process,
        type: 'process-thread-analysis'
      },
      {
        name: this.i18n.mission_create.missEvent,
        type: 'miss_event'
      },
      {
        name: this.i18n.mission_create.cPlusPlus,
        type: 'C/C++ Program'
      },
      {
        name: this.i18n.mission_create.lock,
        type: 'system_lock'
      },
      {
        name: this.i18n.mission_create.java,
        type: 'java-mixed-mode'
      }
    ];
  }
  public i18n: any;
  @ViewChild('missionModal') missionModal: any;
  @Output() public outer = new EventEmitter<any>();
  @Input() public typeId: number;
  @Input() public type: string;
  @Input() missName: string;
  public missionDetail: any;
  public data: any = {
    analysisType: '',
    templateList: []
  };
  public dataArr: any;
  public show: any;
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  public missArr: any = ['C/C++ Program', 'java-mixed-mode', 'process-thread-analysis', 'system',
    'system_config', 'resource_schedule', 'system_lock', 'mem_access', 'microarchitecture', 'miss_event'];
  public cPs = 'Profile System';
  public cAtp = 'Attach to Process';
  public cLa = 'Launch Application';
  public analysisTypesDir: any;
  public nodata: any = './assets/img/projects/nodata.png';
  public isDisabled = true;
  public collapsed = true;
  public simplingIndex: any;
  // 处理模板分析类型
  public taskType: any = {};
  public simplingArr = [
    { id: 'badSpeculation', text: 'Bad Speculation', tip: 'testtest' },
    { id: 'frontEndBound', text: 'Front-End Bound', tip: 'testtest' },
    { id: 'resourceBound', text: 'Back-End Bound->Resource Bound', tip: 'testtest' },
    { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: 'testtest' },
    { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: 'testtest' },
  ];
  ngOnInit() {
    // 详细任务条目名称
    this.missionDetail = [
      [
        [
          // cPs
          { title: this.i18n.mission_modal.cProcess.taskname },
          { title: this.i18n.mission_modal.cProcess.duration },
          { title: this.i18n.ddr.cpuToBeSamples },
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
          // cAtp
          { title: this.i18n.mission_modal.cProcess.taskname },
          { title: this.i18n.mission_modal.cProcess.pid },
          { title: this.i18n.mission_create.process_alias },
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
          { title: this.i18n.mission_modal.cProcess.taskname },
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
          { title: this.i18n.mission_modal.javaMix.taskname },
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
          { title: this.i18n.mission_modal.javaMix.taskname },
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
        { title: this.i18n.mission_modal.process.taskname },
        { title: this.i18n.mission_modal.process.interval },
        { title: this.i18n.mission_modal.process.duration },
        { title: this.i18n.mission_modal.process.task_params },
        { title: this.i18n.mission_modal.process.pid },
        { title: this.i18n.mission_modal.process.straceAnalysis },
        { title: this.i18n.mission_modal.process.thread },
      ],
      [
        // ok
        { title: this.i18n.mission_modal.panoramic.taskname },
        { title: this.i18n.mission_modal.panoramic.interval },
        { title: this.i18n.mission_modal.panoramic.duration },
        { dssTitle: this.i18n.sys.scenes_dds, bigDataTitle: this.i18n.sys.scenes_bigData },
        { title: this.i18n.sys.scenes_top },
      ],
      [
        // ok
        { title: this.i18n.mission_modal.sysConfig.taskname },
        { title: this.i18n.mission_modal.sysConfig.task_params },
      ],
      [
        [
          { title: this.i18n.mission_modal.sysSource.taskname },
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
          { title: this.i18n.mission_modal.sysSource.taskname },
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
          { title: this.i18n.mission_modal.sysSource.taskname },
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
          { title: this.i18n.mission_modal.syslock.taskname },
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
          { title: this.i18n.mission_create.collection_size },
        ],
        [
          // mAtp
          { title: this.i18n.mission_modal.syslock.taskname },
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
          { title: this.i18n.mission_create.collection_size },
        ],
        [
          // mLa
          { title: this.i18n.mission_modal.syslock.taskname },
          { title: this.i18n.mission_modal.cProcess.app_path },
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
          { title: this.i18n.mission_create.collection_size },
        ],
      ],
      [
        { title: this.i18n.mission_modal.memAccess.taskname },
        { title: this.i18n.mission_modal.memAccess.interval },
        { title: this.i18n.mission_modal.memAccess.duration },
        { title: this.i18n.mission_modal.sysConfig.task_params },
      ]
    ];
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

  }
  public change(i: number): void {
    this.data.templateList[i].isShow = !this.data.templateList[i].isShow;
    for (let j = 0; j !== i; j++) {
      this.data.templateList[j].isShow = true;
    }
    for (let j = this.data.templateList.length - 1; j !== i; j--) {
      this.data.templateList[j].isShow = true;
    }
    this.isDisabled = this.data.templateList.every((val: any) => {
      return val.isShow === true;
    });
  }

  // typeList是因为访存分析对应访存统计分析和Miss事件两个任务，需要同时获取
  public open({ type, typeList }: any): void {
    this.missName = type;
    if (type === 'network_diagnostic') {
      this.getData(['network_diagnostic']);
      this.type = this.i18n.diagnostic.taskParams.networkIO;
    } else if (type === 'memory_diagnostic') {
      this.type = this.i18n.diagnostic.taskParams.ram;
      this.getData(['memory_diagnostic']);
    } else if (type === 'storageio_diagnostic') {
      this.type = this.i18n.diagnostic.taskParams.storageIO;
      this.getData(['storageio_diagnostic']);
    } else {
      this.data.templateList = [];
      const getUrlParams = (analysisType: any) => {
        return analysisType === 'C/C++ Program' ? 'c-cpp-program' : analysisType;
      };

      if (this.missName) {
        this.getData(typeList ? typeList.map((item: any) => getUrlParams(item)) : [getUrlParams(type)]);
      }
    }
    this.missionModal.open();
  }
  public confirm(): any {
    this.data.templateList.forEach((item: any) => {

      if (!item.isShow) {
        // 传给父组件
        const tem = document.getElementsByName('template');
        for (let j = 0; j < this.data.length; j++) {
          this.data[j].isShow = true;
          tem[j].style.marginBottom = 8 + 'px';
        }
        this.ioImportService.importTpl(item);
        this.hpcImportService.importTpl(item);
        this.outer.emit(item);
        // 关闭本组件
        this.missionModal.close();
      }
    });
  }
  public isInterval(text: any) {
    if (text.includes(this.i18n.common_term_task_crate_interval_ms) || text.includes(this.i18n.ddr.collectionDelay)) {
      return true;
    } else {
      return false;
    }
  }
  public cancle(): void {
    const tem = document.getElementsByName('template');
    if (this.data) {
      for (let j = 0; j < this.data.templateList.length; j++) {
        this.data.templateList[j].isShow = true;
        tem[j].style.marginBottom = 8 + 'px';
      }
    }
    this.missionModal.close();
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
    return taskInfo?.['analysis-type'] || taskInfo?.analysisType;
  }

  // 根据 template 计算出显示信息【目前只有访存分析在使用】
  public calcTemplateInfo(formEl: any, template: any) {
    // 访存分析所有参数
    const labelOrder = [
      'taskName', 'analysisObject', 'analysisMode', 'application', 'applicationParams', 'switchState',
      'user_name', 'password', 'process_name', 'pid', 'analysisType', 'memAnalysisMode', 'samplingTime',
      'samplingInterval', 'samplingType', 'samplingInterval_instructionsNum', 'minimumDelay',
      'delayCollectionTime', 'indicatorType', 'expandBtn', 'cpuToBeSamples', 'samplingRange', 'b_s', 'symbolFilePath',
      'c_source', 'kcore', 'filesize', 'perfDataLimit'];
    const templateInfo: any = {};
    const userKey = [this.i18n.common_term_task_crate_app_runUser,
    this.i18n.common_term_task_crate_app_user, this.i18n.common_term_task_crate_app_passWord];

    const parentFormEl = new MemAnalysisModeForm();
    parentFormEl.generateFormGroup();
    parentFormEl.customForm({ formEl: parentFormEl });

    const values = formEl.paramsToValues({ params: JSON.parse(JSON.stringify(template)) });
    const configList: any[] = [];

    parentFormEl.setValues({
      values,
      formEl: parentFormEl,
      type: 'text',
      i18n: this.i18n,
    });
    const parentFormElDisplayedElementList = parentFormEl.displayedElementList.filter((item: any) => {
      return !['analysisObject', 'analysisType'].includes(item);
    });
    parentFormElDisplayedElementList.forEach((item: any) => {
      const el = parentFormEl.form[item];
      const num = labelOrder.indexOf(item) !== -1 ? labelOrder.indexOf(item) : labelOrder.length;
      if (!userKey.includes(el.label)) {
        configList.push({
          key: el.label,
          text: [undefined, ''].includes(el.text) ? '--' : el.text,
          requier: '',
          order: num
        });
      }
    });

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
    formEl.displayedElementList.forEach((item: any) => {
      const num = labelOrder.indexOf(item) !== -1 ? labelOrder.indexOf(item) : labelOrder.length;
      const el = formEl.form[item];
      configList.push({
        key: el.label,
        text: [undefined, ''].includes(el.text) ? '--' : el.text,
        requier: '',
        order: num
      });
    });
    configList.sort((a: any, b: any) => a.order - b.order);

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

        return nodeFormEL.displayedElementList.map((item: any) => {
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
    const item = typeOptions.find(val => {
      return val.id === template;
    });
    const typeItem = item ? item.label : '--';
    return typeItem;
  }
  public getCorJavaType(template: any) {
    // java 采样范围
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
  // 请求数据
  public getData(urlParamsList: any): void {
    // 当前所需的模板类型
    let requiredTemplateType: any = [];
    if (this.typeId === 0) {
      requiredTemplateType = ['Profile System', 'sys', undefined];
    } else if (this.typeId === 1) {
      requiredTemplateType = ['Launch Application', 'app'];
    } else if (this.typeId === 2) {
      requiredTemplateType = ['Attach to Process', 'pid'];
    }

    // 获取模板列表
    const getTemplateList = (urlParams: any) => {
      return new Promise((resolve, reject) => {
        let isstorage = false;
        let urlPath = `${this.url.toolTask}templates/?analysis-type=${encodeURIComponent(urlParams)}`;
        if (urlParamsList[0] === 'memory_diagnostic') {
          urlPath = '/memory-tasks/templates/';
        } else if (urlParamsList[0] === 'network_diagnostic' || urlParamsList[0] === 'storageio_diagnostic') {
          urlPath = '/diagnostic-tasks/templates/';
        }
        if (urlParamsList[0] === 'storageio_diagnostic') {
          isstorage = true;
        }
        this.Axios.axios.get(urlPath).then((res: any) => {
          const templateList: any = [];
          const storageioTemplateList: any = [];
          res.data['template-list'].forEach((template: any) => {
            const analysisTarget = this.getAnalysisTarget({ taskInfo: template });
            const analysisType = this.getAnalysisType({ taskInfo: template });
            template.detailTarget = TaskDetailMode.TEMPLATE_IMPORT;
            // 在此处的if中进行templateList的筛选
            if (requiredTemplateType.includes(analysisTarget)) {
              const taskData = template;
              if (analysisType === 'mem_access') { // 访存统计分析
                const formEl: any = new MemAccessForm();
                formEl.generateFormGroup();
                const templateInfo = this.calcTemplateInfo(formEl, template);
                Object.assign(template, templateInfo);
                template.isShow = true;
                templateList.push(template);
              } else if (analysisType === 'miss_event') { // Miss事件统计
                const formEl: any = new MissEventForm();
                formEl.generateFormGroup();
                const templateInfo = this.calcTemplateInfo(formEl, template);
                Object.assign(template, templateInfo);
                template.isShow = true;
                templateList.push(template);
              } else if (analysisType === 'falsesharing') { // 伪共享分析
                const formEl: any = new FalseSharingForm(this.i18n);
                formEl.generateFormGroup();
                const templateInfo = this.calcTemplateInfo(formEl, template);
                Object.assign(template, templateInfo);
                template.isShow = true;
                templateList.push(template);
              } else if (analysisType === 'process-thread-analysis') { // 进程/线程分析
                const templateInfo: any = {};
                let a = '';
                taskData.task_param.type.forEach((item: any, index: any) => {
                  if (index < taskData.task_param.type.length - 1) {
                    a += this.taskType[item] + this.i18n.sys.douhao;
                  } else {
                    a += this.taskType[item];
                  }
                });
                let appOrPidConfig: any = [];
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
                    templateInfo.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                      return [
                        {
                          key: this.i18n.common_term_task_crate_pid,
                          text: item.task_param.pid || '--',
                          requier: ''
                        },
                        {
                          key: this.i18n.mission_create.process_alias,
                          text: item.task_param.process_name || '--',
                          requier: ''
                        }
                      ];
                    });
                    break;
                  case 'Launch Application':
                    appOrPidConfig = [
                      {
                        key: this.i18n.mission_modal.cProcess.app_path,
                        text: taskData['app-dir'] || '--',
                        requier: ''
                      },
                      {
                        key: this.i18n.mission_modal.cProcess.app_params,
                        text: taskData['app-parameters'] || '--',
                        requier: ''
                      }
                    ];
                    templateInfo.panelList = taskData.nodeConfig.map((item: any, index: any) => {
                      return [
                        {
                          key: this.i18n.common_term_task_crate_app_path,
                          text: item.task_param['app-dir'],
                          requier: ''
                        },
                        {
                          key: this.i18n.common_term_task_crate_parameters,
                          text: item.task_param['app-parameters'] || '--',
                          requier: ''
                        }
                      ];
                    });
                    break;
                  default:
                }
                templateInfo.configList = [
                  {
                    key: this.i18n.task_name,
                    text: taskData.taskname,
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
                  {
                    key: this.i18n.sys.type,
                    text: a,
                    requier: ''
                  },
                ];
                if (taskData['analysis-target'] !== 'Profile System') {
                  templateInfo.configList.push({
                    key: this.i18n.process.trace,
                    text: taskData['strace-analysis'] === 'enable'
                      ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                  });
                }
                templateInfo.configList.push({
                  key: this.i18n.process.tread,
                  text: taskData.thread === 'enable' ? this.i18n.process.enable : this.i18n.process.disable,
                  requier: ''
                });
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
                  templateInfo.configList.push(...scheduleParams);
                }
                Object.assign(template, templateInfo);
                template.isShow = true;
                templateList.push(template);
              } else if (analysisType === 'netio_diagnostic') {
                template.isShow = true;
                templateList.push(template);
              } else if (analysisType === 'storageio_diagnostic') {
                template.isShow = true;
                storageioTemplateList.push(template);
              } else { // 其他任务类型
                template.isShow = true;
                this.simplingArr.forEach((val: any) => {
                  if (template?.analysisIndex?.indexOf(val.id) > -1) {
                    this.simplingIndex = val.text;
                  }
                });
                this.simplingIndex = this.simplingIndex ?? '--';
                templateList.push(template);
              }
            }
          });
          if (isstorage) {
            resolve(storageioTemplateList);
          } else {
            resolve(templateList);
          }
        }).catch((err: any) => {
          reject(err);
        });
      });
    };

    Promise.all(urlParamsList.map((urlParams: any) => getTemplateList(urlParams))).then((res: any) => {
      this.data.templateList = [].concat.apply([], res);
    });
    this.isDisabled = true;
  }

  // 处理采集日期
  public handleColectDate(obj: any) {
    return obj.cycle ? (obj.cycleStart && obj.cycleStart ? obj.cycleStart.split('-').join('/') + '一' +
      obj.cycleStop.split('-').join('/') : '') : (obj.appointment ? obj.appointment.split('-').join('/') : '');
  }
  handleObj(val: any) {
    let arr = [];
    arr = val.type.map((item: any) => {
      return this.taskType[item];
    });
    return arr.join(',');
  }
  // 处理分析类型
  handleAnalysisType(type: any) {
    return this.analysisTypesDir.find((item: any) => {
      return item.name = item.type === type;
    });
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
