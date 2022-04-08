import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { ListInfoService } from '../../../service/taskService/list-info.service';

import { BaseForm } from '../../taskParams/BaseForm';
import { MemAnalysisModeForm } from '../../taskParams/modules/MemAnalysisModeForm';
import { MemAccessForm } from '../../taskParams/modules/MemAccessForm';
import { MissEventForm } from '../../taskParams/modules/MissEventForm';
import { FalseSharingForm } from '../../taskParams/modules/FalseSharingForm';
import { AllParams } from '../../taskParams/AllParams';
import * as Util from 'projects/sys/src-web/app/util';

@Component({
  selector: 'app-mission-reservation-listinfo',
  templateUrl: './mission-reservation-listinfo.component.html',
  styleUrls: ['./mission-reservation-listinfo.component.scss'],
})
export class MissionReservationListinfoComponent implements OnInit {
  constructor(
    public i18nService: I18nService,
    private listInfoService: ListInfoService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @Input() taskData: any;
  public i18n: any;
  public missionDetail: any;
  public cPs = 'Profile System';
  public cAtp = 'Attach to Process';
  public cLa = 'Launch Application';
  public configList: any = [];
  public missConfigList: any = [];
  public panelList: any = [];
  public ifShow = false;
  // 处理模板分析类型
  public taskType: any = {};
  public simplingArr = [
    { id: 'badSpeculation', text: 'Bad Speculation', tip: 'testtest' },
    { id: 'frontEndBound', text: 'Front-End Bound', tip: 'testtest' },
    {
      id: 'resourceBound',
      text: 'Back-End Bound->Resource Bound',
      tip: 'testtest',
    },
    { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: 'testtest' },
    {
      id: 'memoryBound',
      text: 'Back-End Bound->Memory Bound',
      tip: 'testtest',
    },
  ];
  ngOnInit() {
    // 详细任务条目名称
    (this.missionDetail = [
      [
        [
          // cPs
          { title: this.i18n.mission_modal.cProcess.taskname },
          { title: this.i18n.mission_modal.cProcess.analysis_type },
          { title: this.i18n.mission_modal.cProcess.duration },
          { title: this.i18n.ddr.cpuToBeSamples },
          { title: this.i18n.mission_modal.cProcess.cpu_interval },
          { title: this.i18n.mission_modal.cProcess.file_path },
          { title: this.i18n.mission_modal.cProcess.source_path },
        ],
        [
          // cAtp
          { title: this.i18n.mission_modal.cProcess.taskname },
          { title: this.i18n.mission_modal.cProcess.analysis_type },
          { title: this.i18n.mission_modal.cProcess.pid },
          { title: this.i18n.mission_modal.cProcess.duration },
          { title: this.i18n.mission_modal.cProcess.cpu_interval },
          { title: this.i18n.mission_modal.cProcess.file_path },
          { title: this.i18n.mission_modal.cProcess.source_path },
        ],
        [
          // cLa
          { title: this.i18n.mission_modal.cProcess.taskname },
          { title: this.i18n.mission_modal.cProcess.analysis_type },
          { title: this.i18n.mission_modal.cProcess.app_params },
          { title: this.i18n.mission_modal.cProcess.app_path },
          { title: this.i18n.mission_modal.cProcess.cpu_interval },
          { title: this.i18n.mission_modal.cProcess.file_path },
          { title: this.i18n.mission_modal.cProcess.source_path },
        ],
      ],
      [
        [
          { title: this.i18n.mission_modal.javaMix.taskname },
          { title: this.i18n.mission_modal.javaMix.analysis_type },
          { title: this.i18n.mission_modal.javaMix.pid },
          { title: this.i18n.mission_modal.javaMix.duration },
          { title: this.i18n.mission_modal.javaMix.cpu_interval },
          { title: this.i18n.mission_modal.javaMix.java_path },
        ],
        [
          { title: this.i18n.mission_modal.javaMix.taskname },
          { title: this.i18n.mission_modal.javaMix.analysis_type },
          { title: this.i18n.mission_modal.javaMix.application },
          { title: this.i18n.mission_modal.javaMix.app_params },
          { title: this.i18n.mission_modal.javaMix.cpu_interval },
          { title: this.i18n.mission_modal.javaMix.java_path },
        ],
      ],
      [
        { title: this.i18n.mission_modal.process.taskname },
        { title: this.i18n.mission_modal.process.duration },
        { title: this.i18n.mission_modal.process.interval },
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
        { title: this.i18n.mission_modal.panoramic.task_params },
      ],
      [
        // ok
        { title: this.i18n.mission_modal.sysConfig.taskname },
        { title: this.i18n.mission_modal.sysConfig.task_params },
      ],
      [
        [
          { title: this.i18n.mission_modal.sysSource.taskname },
          { title: this.i18n.mission_modal.sysSource.analysis_type },
          { title: this.i18n.mission_modal.sysSource.duration },
          { title: this.i18n.mission_modal.sysSource.file_path },
          { title: this.i18n.mission_modal.sysSource.source_path },
          {
            title:
              this.i18n.falsesharing.filesize +
              ' ' +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
          },
        ],
        [
          { title: this.i18n.mission_modal.sysSource.taskname },
          { title: this.i18n.mission_modal.sysSource.analysis_type },
          { title: this.i18n.mission_modal.sysSource.pid },
          { title: this.i18n.mission_modal.sysSource.duration },
          { title: this.i18n.mission_modal.sysSource.file_path },
          { title: this.i18n.mission_modal.sysSource.source_path },
          {
            title:
              this.i18n.falsesharing.filesize +
              ' ' +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
          },
        ],
        [
          { title: this.i18n.mission_modal.sysSource.taskname },
          { title: this.i18n.mission_modal.sysSource.analysis_type },
          { title: this.i18n.mission_modal.sysSource.application },
          { title: this.i18n.mission_modal.sysSource.app_params },
          { title: this.i18n.mission_modal.sysSource.file_path },
          { title: this.i18n.mission_modal.sysSource.source_path },
          {
            title:
              this.i18n.falsesharing.filesize +
              ' ' +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
          },
        ],
      ],
      [
        [
          // mPs
          { title: this.i18n.mission_modal.syslock.taskname },
          { title: this.i18n.mission_modal.syslock.analysis_type },
          { title: this.i18n.mission_modal.syslock.duration },
          { title: this.i18n.mission_modal.syslock.cpu_interval },
          { title: this.i18n.micarch.label.typeItem },
          { title: this.i18n.mission_modal.syslock.function },
          { title: this.i18n.mission_modal.lockSummary.filname },
          { title: this.i18n.mission_modal.lockSummary.source_path },
          {
            title:
              this.i18n.falsesharing.filesize +
              ' ' +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
          },
        ],
        [
          // mAtp
          { title: this.i18n.mission_modal.syslock.taskname },
          { title: this.i18n.mission_modal.syslock.analysis_type },
          { title: this.i18n.mission_modal.syslock.pid },
          { title: this.i18n.mission_modal.syslock.duration },
          { title: this.i18n.mission_modal.syslock.cpu_interval },
          { title: this.i18n.micarch.label.typeItem },
          { title: this.i18n.mission_modal.syslock.function },
          { title: this.i18n.mission_modal.lockSummary.filname },
          { title: this.i18n.mission_modal.lockSummary.source_path },
          {
            title:
              this.i18n.falsesharing.filesize +
              ' ' +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
          },
        ],
        [
          // mLa
          { title: this.i18n.mission_modal.syslock.taskname },
          { title: this.i18n.mission_modal.syslock.analysis_type },
          { title: this.i18n.mission_modal.syslock.app_params },
          { title: this.i18n.mission_modal.syslock.app_path },
          { title: this.i18n.mission_modal.syslock.cpu_interval },
          { title: this.i18n.micarch.label.typeItem },
          { title: this.i18n.mission_modal.syslock.function },
          { title: this.i18n.mission_modal.lockSummary.filname },
          { title: this.i18n.mission_modal.lockSummary.source_path },
          {
            title:
              this.i18n.falsesharing.filesize +
              ' ' +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
          },
        ],
      ],
      [
        { title: this.i18n.mission_modal.memAccess.taskname },
        { title: this.i18n.mission_modal.memAccess.interval },
        { title: this.i18n.mission_modal.memAccess.duration },
        { title: this.i18n.mission_modal.sysConfig.task_params },
      ],
    ]),
      (this.taskType = {
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
      });
    this.open();
    this.listInfoService.getMessage().subscribe((res) => { });
  }

  // 根据 taskInfo 返回 analysisTarget
  public getAnalysisTarget({ taskInfo }: any) {
    const missAnalysisTarget: any = {
      sys: 'Profile System',
      app: 'Launch Application',
      pid: 'Attach to Process',
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
  public calcTemplateInfo(
    formEl: any,
    template: any,
    listNotDisplay = ['analysisObject', 'analysisType']
  ) {
    const templateInfo: any = { configList: [], panelList: [] };

    const parentFormEl = new MemAnalysisModeForm();
    parentFormEl.generateFormGroup();
    parentFormEl.customForm({ formEl: parentFormEl });

    const values = formEl.paramsToValues({
      params: JSON.parse(JSON.stringify(template)),
    });
    parentFormEl.setValues({
      values,
      formEl: parentFormEl,
      type: 'text',
      i18n: this.i18n,
    });

    const userKey = ['switchState', 'user_name', 'password'];
    const configList1 = parentFormEl.displayedElementList
      .filter((item: any) => {
        return !(listNotDisplay.concat(userKey)).includes(item);
      })
      .map((item: any) => {
        const el = parentFormEl.form[item];

        return {
          key: el.label,
          text: [undefined, ''].includes(el.text) ? '--' : el.text,
          requier: '',
          order: el.order,
        };
      })
      .sort((a, b) => a.order - b.order);

    if (formEl.setAnalysisObject) {
      formEl.setAnalysisObject(
        values.analysisObject === 'analysisObject_sys'
          ? 'analysisObject_sys'
          : values.analysisMode
      );
    }
    formEl.setValues({
      values,
      formEl,
      type: 'text',
      i18n: this.i18n,
    });

    const configList2 = formEl.displayedElementList
        .map((item: any) => {
          const el = formEl.form[item];

          return {
            key: el.label,
            text: [undefined, ''].includes(el.text) ? '--' : el.text,
            requier: '',
            order: el.order,
          };
        })
        .sort((a: any, b: any) => a.order - b.order);
    templateInfo.configList = configList1.concat(configList2);

    // 添加节点参数
    if (formEl.hasNodeConfig) {
      const nodeEditList = formEl.getNodeConfigKeys({
        analysisObject: values.analysisObject,
        analysisMode: values.analysisMode,
      });

      templateInfo.panelList = template.nodeConfig.map(
        (node: any, index: any) => {
          const nodeFormEL = new BaseForm();
          const allParamsClone = nodeFormEL.deepClone(
            new AllParams().allParams
          );

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

          return nodeFormEL.displayedElementList
            .filter((item: any) => {
              return !(listNotDisplay.concat(userKey)).includes(item);
            })
            .map((item: any) => {
              const el = nodeFormEL.form[item];
              return {
                key: el.label,
                text: [undefined, ''].includes(el.text) ? '--' : el.text,
                requier: '',
                order: el.order,
              };
            })
            .sort((a, b) => a.order - b.order);
        }
      );
    }
    return templateInfo;
  }
  public isInterval(text: any) {
    if (
      text?.includes(this.i18n.common_term_task_crate_interval_ms) ||
      text?.includes(this.i18n.ddr.collectionDelay)
    ) {
      return true;
    } else {
      return false;
    }
  }
  public exchangeType(taskData: any, data: any) {
    if (!Object.prototype.hasOwnProperty.call(taskData, 'samplingSpace')) {
      return 'updateNodata';
    }
    if (data === 'all') {
      return this.i18n.micarch.typeItem_all;
    } else if (data === 'user') {
      return this.i18n.micarch.typeItem_user;
    } else if (data === 'kernel') {
      return this.i18n.micarch.typeItem_kernel;
    } else {
      return '--';
    }
  }
  public getCorJavaType(data: any) {
    if (!Object.prototype.hasOwnProperty.call(data, 'samplingSpace')) {
      return 'updateNodata';
    }
    const template = data.samplingSpace.id;
    //  采样范围
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
    const item = typeOptions.find((val) => {
      return val.id === template;
    });
    const typeItem = item ? item.label : '--';
    return typeItem;
  }
  public getLockType(data: any) {
    if (!Object.prototype.hasOwnProperty.call(data, 'collect_range')) {
      return 'updateNodata';
    }
    const template = data.collect_range;
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
    const item = typeOptions.find((val) => {
      return val.id === template;
    });
    const typeItem = item ? item.label : '--';
    return typeItem;
  }
  public getSize(data: any) {
    const analysisType =
      this.taskData['analysis-type'] || this.taskData.analysisType;
    if (analysisType === 'microarchitecture') {
      if (!Object.prototype.hasOwnProperty.call(data, 'perfDataLimit')) {
        return 'updateNodata';
      }
    } else if (analysisType === 'system_lock') {
      if (!Object.prototype.hasOwnProperty.call(data, 'collect_file_size')) {
        return 'updateNodata';
      }
    } else if (!Object.prototype.hasOwnProperty.call(data, 'size')) {
      return 'updateNodata';
    }
    const size = data.size || data.perfDataLimit || data.collect_file_size;
    const sizeData = size !== undefined && size !== '' ? size : '--';
    return sizeData;
  }
  public open() {
    this.ifShow = true;
    const taskData = this.taskData;
    const analysisType = taskData['analysis-type'] || taskData.analysisType;
    if (analysisType.indexOf('C++') > -1) {
      if (taskData['analysis-target'].indexOf('Launch') > -1) {
        this.configList = [
          {
            // 模式
            key: this.i18n.mission_create.mode,
            text: taskData['analysis-target'],
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_app_path,
            text:
              taskData['app-dir'] !== undefined && taskData['app-dir'] !== ''
                ? taskData['app-dir']
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_parameters,
            text:
              taskData['app-parameters'] !== undefined &&
                taskData['app-parameters'] !== ''
                ? taskData['app-parameters']
                : '--',
            requier: '',
          },
          {
            key:
              this.i18n.common_term_task_crate_interval_ms +
              ' (' +
              (taskData.interval === '0.71'
                ? this.i18n.common_term_task_crate_us
                : this.i18n.common_term_task_crate_ms) +
              ')',
            text: Util.fixThouSeparator(
              taskData.interval !== undefined && taskData.interval !== ''
                ? taskData.interval === '0.71'
                  ? taskData.interval * 1000
                  : taskData.interval
                : '--'
            ),
            requier: '',
          },
          {
            key: this.i18n.ddr.samplingRange,
            text: this.getCorJavaType(taskData),
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_bs_path,
            text:
              taskData.assemblyLocation !== undefined &&
                taskData.assemblyLocation !== ''
                ? taskData.assemblyLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_c_path,
            text:
              taskData.sourceLocation !== undefined &&
                taskData.sourceLocation !== ''
                ? taskData.sourceLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.kcore,
            text: taskData.kcore
              ? this.i18n.process.enable
              : this.i18n.process.disable,
            requier: '',
          },
          {
            key:
              this.i18n.falsesharing.filesize +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_app_path,
              text: item.task_param['app-dir'] || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_parameters,
              text: item.task_param['app-parameters'] || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_bs_path,
              text: item.task_param.assemblyLocation || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_c_path,
              text: item.task_param.sourceLocation || '--',
              requier: '',
            },
          ];
        });
      } else if (taskData['analysis-target'].indexOf('Profile') > -1) {
        this.configList = [
          {
            // 采样时长(s)
            key: this.i18n.common_term_task_crate_duration,
            text:
              taskData.duration !== undefined && taskData.duration !== ''
                ? taskData.duration
                : '--',
            requier: '',
          },
          {
            // 采样间隔(ms)
            key:
              this.i18n.common_term_task_crate_interval_ms +
              ' (' +
              (taskData.interval === '0.71'
                ? this.i18n.common_term_task_crate_us
                : this.i18n.common_term_task_crate_ms) +
              ')',
            text: Util.fixThouSeparator(
              taskData.interval !== undefined && taskData.interval !== ''
                ? taskData.interval === '0.71'
                  ? taskData.interval * 1000
                  : taskData.interval
                : '--'
            ),
            requier: '',
          },
          {
            // 采样范围
            key: this.i18n.ddr.samplingRange,
            text: this.getCorJavaType(taskData),
            requier: '',
          },
          {
            // 待采样CPU核
            key: this.i18n.ddr.cpuToBeSamples,
            text:
              taskData['cpu-mask'] !== undefined && taskData['cpu-mask'] !== ''
                ? taskData['cpu-mask']
                : '--',
            requier: '',
          },
          {
            // 二进制/符号文件路径
            key: this.i18n.common_term_task_crate_bs_path,
            text:
              taskData.assemblyLocation !== undefined &&
                taskData.assemblyLocation !== ''
                ? taskData.assemblyLocation
                : '--',
            requier: '',
          },
          {
            // C/C++源文件路径
            key: this.i18n.common_term_task_crate_c_path,
            text:
              taskData.sourceLocation !== undefined &&
                taskData.sourceLocation !== ''
                ? taskData.sourceLocation
                : '--',
            requier: '',
          },
          {
            // 内核函数关联汇编代码
            key: this.i18n.mission_create.kcore,
            text: taskData.kcore
              ? this.i18n.process.enable
              : this.i18n.process.disable,
            requier: '',
          },
          {
            // 采集文件大小(MiB)
            key:
              this.i18n.falsesharing.filesize +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.ddr.cpuToBeSamples,
              text: item.task_param['cpu-mask'] || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_bs_path,
              text: item.task_param.assemblyLocation || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_c_path,
              text: item.task_param.sourceLocation || '--',
              requier: '',
            },
          ];
        });
      } else if (taskData['analysis-target'].indexOf('Attach') > -1) {
        this.configList = [
          {
            // 模式
            key: this.i18n.mission_create.mode,
            text: taskData['analysis-target'],
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_pid,
            text:
              taskData['target-pid'] !== undefined &&
                taskData['target-pid'] !== ''
                ? taskData['target-pid']
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.process_alias,
            text:
              taskData.process_name !== undefined &&
                taskData.process_name !== ''
                ? taskData.process_name
                : '--',
            requier: '',
          },
          {
            // 采样时长(s)
            key: this.i18n.common_term_task_crate_duration,
            text:
              taskData.duration !== undefined && taskData.duration !== ''
                ? taskData.duration
                : '--',
            requier: '',
          },
          {
            key:
              this.i18n.common_term_task_crate_interval_ms +
              ' (' +
              (taskData.interval === '0.71'
                ? this.i18n.common_term_task_crate_us
                : this.i18n.common_term_task_crate_ms) +
              ')',
            text: Util.fixThouSeparator(
              taskData.interval !== undefined && taskData.interval !== ''
                ? taskData.interval === '0.71'
                  ? taskData.interval * 1000
                  : taskData.interval
                : '--'
            ),
            requier: '',
          },
          {
            key: this.i18n.ddr.samplingRange,
            text: this.getCorJavaType(taskData),
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_bs_path,
            text:
              taskData.assemblyLocation !== undefined &&
                taskData.assemblyLocation !== ''
                ? taskData.assemblyLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_c_path,
            text:
              taskData.sourceLocation !== undefined &&
                taskData.sourceLocation !== ''
                ? taskData.sourceLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.kcore,
            text: taskData.kcore
              ? this.i18n.process.enable
              : this.i18n.process.disable,
            requier: '',
          },
          {
            key:
              this.i18n.falsesharing.filesize +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_pid,
              text:
                item.task_param['target-pid'] !== undefined &&
                  item.task_param['target-pid'] !== ''
                  ? item.task_param['target-pid']
                  : '--',
              requier: '',
            },
            {
              key: this.i18n.mission_create.process_alias,
              text:
                item.task_param.process_name !== undefined &&
                  item.task_param.process_name !== ''
                  ? item.task_param.process_name
                  : '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_bs_path,
              text: item.task_param.assemblyLocation || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_c_path,
              text: item.task_param.sourceLocation || '--',
              requier: '',
            },
          ];
        });
      }
    } else if (analysisType === 'system') {
      this.configList = [
        {
          key: this.i18n.sys.duration,
          text: taskData.duration || '--',
        },
        {
          key: this.i18n.sys.interval,
          text: Util.fixThouSeparator(taskData.interval) || '--',
        },
        {
          key: this.i18n.sys.scenes_top,
          text:
            taskData.topCheck === true
              ? this.i18n.status_Yes
              : this.i18n.status_No,
        },
      ];
      if (Object.prototype.hasOwnProperty.call(taskData, 'sceneSolution')) {
        if (taskData.sceneSolution < 2) {
          const scenesTitleMap = [
            this.i18n.sys.scenes_dds,
            this.i18n.sys.scenes_bigData,
          ];
          this.configList.splice(3, 0, {
            key: scenesTitleMap[taskData.sceneSolution],
            text: taskData.configDir || '--',
            ifShow: Object.prototype.hasOwnProperty.call(taskData, 'configDir'),
          });
        } else {
          this.configList.splice(
            3,
            0,
            {
              key: this.i18n.databaseConfig.ip,
              text: taskData.sqlIp,
            },
            {
              key: this.i18n.databaseConfig.port,
              text: taskData.sqlPort,
            },
            {
              key: this.i18n.databaseConfig.username,
              text: taskData.sqlUser,
            },
            {
              key: this.i18n.databaseConfig.password,
              text: taskData.sqlPwd,
            }
          );
        }
      }
      this.panelList = taskData.nodeConfig.map((item: any) => {
        return [
          {
            key: this.i18n.databaseConfig.ip,
            text: item.task_param.sqlIp,
          },
          {
            key: this.i18n.databaseConfig.port,
            text: item.task_param.sqlPort,
          },
          {
            key: this.i18n.databaseConfig.username,
            text: item.task_param.sqlUser,
          },
          {
            key: this.i18n.databaseConfig.password,
            text: item.task_param.sqlPwd,
          },
        ];
      });
    } else if (analysisType.indexOf('resource') > -1) {
      if (taskData['analysis-target'].indexOf('Launch') > -1) {
        this.configList = [
          {
            // 模式
            key: this.i18n.mission_create.mode,
            text: taskData['analysis-target'],
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_app_path,
            text:
              taskData['app-dir'] !== undefined && taskData['app-dir'] !== ''
                ? taskData['app-dir']
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_parameters,
            text:
              taskData['app-parameters'] !== undefined &&
                taskData['app-parameters'] !== ''
                ? taskData['app-parameters']
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_bs_path,
            text:
              taskData.assemblyLocation !== undefined &&
                taskData.assemblyLocation !== ''
                ? taskData.assemblyLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.collectCallStack,
            text:
              taskData['dis-callstack'] === undefined
                ? '--'
                : taskData['dis-callstack']
                  ? this.i18n.process.enable
                  : this.i18n.process.disable,
            requier: '',
          },
          {
            key:
              this.i18n.falsesharing.filesize +
              ' ' +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_app_path,
              text: item.task_param['app-dir'] || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_parameters,
              text: item.task_param['app-parameters'] || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_bs_path,
              text: item.task_param.assemblyLocation || '--',
              requier: '',
            },
          ];
        });
      } else if (taskData['analysis-target'].indexOf('Profile') > -1) {
        this.configList = [
          {},
          {
            key: this.i18n.common_term_task_crate_duration,
            text:
              taskData.duration !== undefined && taskData.duration !== ''
                ? taskData.duration
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_bs_path,
            text:
              taskData.assemblyLocation !== undefined &&
                taskData.assemblyLocation !== ''
                ? taskData.assemblyLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.collectCallStack,
            text:
              taskData['dis-callstack'] === undefined
                ? '--'
                : taskData['dis-callstack']
                  ? this.i18n.process.enable
                  : this.i18n.process.disable,
            requier: '',
          },
          {
            key:
              this.i18n.falsesharing.filesize +
              ' ' +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_bs_path,
              text: item.task_param.assemblyLocation || '--',
              requier: '',
            },
          ];
        });
      } else if (taskData['analysis-target'].indexOf('Attach') > -1) {
        this.configList = [
          {
            key: this.i18n.mission_create.mode,
            text: taskData['analysis-target'],
            requier: '',
          },

          {
            key: this.i18n.common_term_task_crate_pid,
            text:
              taskData['target-pid'] !== undefined &&
                taskData['target-pid'] !== ''
                ? taskData['target-pid']
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.process_alias,
            text:
              taskData['process-name'] !== undefined &&
                taskData['process-name'] !== ''
                ? taskData['process-name']
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_duration,
            text:
              taskData.duration !== undefined && taskData.duration !== ''
                ? taskData.duration
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_bs_path,
            text:
              taskData.assemblyLocation !== undefined &&
                taskData.assemblyLocation !== ''
                ? taskData.assemblyLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.collectCallStack,
            text:
              taskData['dis-callstack'] === undefined
                ? '--'
                : taskData['dis-callstack']
                  ? this.i18n.process.enable
                  : this.i18n.process.disable,
            requier: '',
          },
          {
            key:
              this.i18n.falsesharing.filesize +
              ' ' +
              this.i18n.ddr.leftParenthesis +
              'MiB' +
              this.i18n.ddr.rightParenthesis,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_pid,
              text:
                item.task_param['target-pid'] !== undefined &&
                  item.task_param['target-pid'] !== ''
                  ? item.task_param['target-pid']
                  : '--',
              requier: '',
            },
            {
              key: this.i18n.mission_create.process_alias,
              text:
                item.task_param['process-name'] !== undefined &&
                  item.task_param['process-name'] !== ''
                  ? item.task_param['process-name']
                  : '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_bs_path,
              text: item.task_param.assemblyLocation || '--',
              requier: '',
            },
          ];
        });
      }
    } else if (analysisType === 'microarchitecture') {
      let simplingIndex = '';
      this.simplingArr.forEach((val) => {
        if (taskData.analysisIndex.indexOf(val.id) > -1) {
          simplingIndex += ',' + val.text;
        }
      });
      if (simplingIndex) {
        simplingIndex = simplingIndex.slice(1);
      } else {
        simplingIndex = '--';
      }
      if (taskData.analysisTarget.indexOf('Launch') > -1) {
        this.configList = [
          {
            key: this.i18n.mission_create.mode,
            text: taskData.analysisTarget || '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_app_path,
            text: taskData.appDir || '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_parameters,
            text: taskData.appParameters || '--',
            requier: '',
          },
          {
            key: this.i18n.micarch.label.simpling,
            text: taskData.samplingMode || '--',
            requier: '',
          },
          {
            key: this.i18n.sys.duration,
            text: taskData.duration || '--',
            requier: '',
          },
          {
            key: this.i18n.mission_modal.syslock.cpu_interval,
            text: Util.fixThouSeparator(taskData.interval || '--'),
            requier: '',
          },
          {
            key: this.i18n.micarch.label.analysis,
            text: simplingIndex,
            requier: '',
          },
          {
            key: this.i18n.micarch.label.typeItem,
            text: this.exchangeType(taskData, taskData.samplingSpace),
            requier: '',
          },
          {
            key: this.i18n.micarch.simpling_delay,
            text: taskData.samplingDelay
              ? taskData.samplingDelay
              : taskData.samplingDelay === 0
                ? 0
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_c_path,
            text:
              taskData.sourceLocation !== undefined &&
                taskData.sourceLocation !== ''
                ? taskData.sourceLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.kcore,
            text: taskData.kcore
              ? this.i18n.process.enable
              : this.i18n.process.disable,
            requier: '',
          },
          {
            key: this.i18n.mission_create.collection_size,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_app_path,
              text: item.taskParam.appDir || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_parameters,
              text: item.taskParam.appParameters || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_c_path,
              text: item.taskParam.sourceLocation || '--',
              requier: '',
            },
          ];
        });
      } else if (taskData.analysisTarget.indexOf('Profile') > -1) {
        this.configList = [
          {
            key: this.i18n.micarch.label.simpling,
            text: taskData.samplingMode || '--',
            requier: '',
          },
          {
            key: this.i18n.sys.duration,
            text: taskData.duration || '--',
            requier: '',
          },
          {
            key: this.i18n.mission_modal.syslock.cpu_interval,
            text: Util.fixThouSeparator(taskData.interval || '--'),
            requier: '',
          },
          {
            key: this.i18n.micarch.label.analysis,
            text: simplingIndex,
            requier: '',
          },
          {
            key: this.i18n.ddr.cpuToBeSamples,
            text: taskData.cpuMask
              ? taskData.cpuMask
              : taskData.cpuMask === 0
                ? 0
                : '--',
            requier: '',
          },
          {
            key: this.i18n.micarch.label.typeItem,
            text: this.exchangeType(taskData, taskData.samplingSpace),
            requier: '',
          },
          {
            key: this.i18n.micarch.simpling_delay,
            text: taskData.samplingDelay
              ? taskData.samplingDelay
              : taskData.samplingDelay === 0
                ? 0
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_c_path,
            text:
              taskData.sourceLocation !== undefined &&
                taskData.sourceLocation !== ''
                ? taskData.sourceLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.kcore,
            text: taskData.kcore
              ? this.i18n.process.enable
              : this.i18n.process.disable,
            requier: '',
          },
          {
            key: this.i18n.mission_create.collection_size,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.ddr.cpuToBeSamples,
              text: item.taskParam.cpuMask || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_c_path,
              text: item.taskParam.sourceLocation || '--',
              requier: '',
            },
          ];
        });
      } else if (taskData.analysisTarget.indexOf('Attach') > -1) {
        this.configList = [
          {
            key: this.i18n.mission_create.mode,
            text: taskData.analysisTarget || '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_pid,
            text: taskData.targetPid || '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.process_alias,
            text: taskData.process_name || '--',
            requier: '',
          },
          {
            key: this.i18n.micarch.label.simpling,
            text: taskData.samplingMode || '--',
            requier: '',
          },
          {
            key: this.i18n.sys.duration,
            text: taskData.duration || '--',
            requier: '',
          },
          {
            key: this.i18n.mission_modal.syslock.cpu_interval,
            text: Util.fixThouSeparator(taskData.interval || '--'),
            requier: '',
          },
          {
            key: this.i18n.micarch.label.analysis,
            text: simplingIndex,
            requier: '',
          },
          {
            key: this.i18n.micarch.label.typeItem,
            text: this.exchangeType(taskData, taskData.samplingSpace),
            requier: '',
          },
          {
            key: this.i18n.micarch.simpling_delay,
            text: taskData.samplingDelay
              ? taskData.samplingDelay
              : taskData.samplingDelay === 0
                ? 0
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_c_path,
            text:
              taskData.sourceLocation !== undefined &&
                taskData.sourceLocation !== ''
                ? taskData.sourceLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.kcore,
            text: taskData.kcore
              ? this.i18n.process.enable
              : this.i18n.process.disable,
            requier: '',
          },
          {
            key: this.i18n.mission_create.collection_size,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_pid,
              text: item.taskParam.targetPid || '--',
              requier: '',
            },
            {
              key: this.i18n.mission_create.process_alias,
              text: item.taskParam.process_name || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_c_path,
              text: item.taskParam.sourceLocation || '--',
              requier: '',
            },
          ];
        });
      }
    } else if (analysisType === 'process-thread-analysis') {
      // 进程/线程分析
      let a = '';
      taskData.task_param.type.forEach((item: any, index: any) => {
        if (index < taskData.task_param.type.length - 1) {
          a += this.taskType[item] + this.i18n.sys.douhao;
        } else {
          a += this.taskType[item];
        }
      });
      if (taskData['analysis-target'].indexOf('Launch') > -1) {
        this.configList = [
          {
            key: this.i18n.mission_create.mode,
            text: taskData['analysis-target'],
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_app_path,
            text: taskData['app-dir'] || '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_parameters,
            text: taskData['app-parameters'] || '--',
            requier: '',
          },
          {
            key: this.i18n.sys.duration,
            text: taskData.duration,
            requier: '',
          },
          {
            key: this.i18n.sys.interval,
            text: Util.fixThouSeparator(taskData.interval),
            requier: '',
          },
          {
            key: this.i18n.sys.type,
            text: a,
            requier: '',
          },
        ];
        this.configList.push({
          key: this.i18n.process.trace,
          text:
            taskData['strace-analysis'] === 'enable'
              ? this.i18n.process.enable
              : this.i18n.process.disable,
          requier: '',
        });
        this.configList.push({
          key: this.i18n.process.tread,
          text:
            taskData.thread === 'enable'
              ? this.i18n.process.enable
              : this.i18n.process.disable,
          requier: '',
        });

        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_app_path,
              text: item.task_param['app-dir'],
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_parameters,
              text: item.task_param['app-parameters'] || '--',
              requier: '',
            },
          ];
        });
      } else if (taskData['analysis-target'].indexOf('Profile') > -1) {
        this.configList = [
          {
            key: this.i18n.sys.duration,
            text: taskData.duration,
            requier: '',
          },
          {
            key: this.i18n.sys.interval,
            text: Util.fixThouSeparator(taskData.interval),
            requier: '',
          },
          {
            key: this.i18n.sys.type,
            text: a,
            requier: '',
          },
          {
            key: this.i18n.process.tread,
            text:
              taskData.thread === 'enable'
                ? this.i18n.process.enable
                : this.i18n.process.disable,
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.nodeConfig.processId,
              text: item.task_param.pid,
              requier: '',
            },
          ];
        });
      } else if (taskData['analysis-target'].indexOf('Attach') > -1) {
        this.configList = [
          {
            key: this.i18n.mission_create.mode,
            text: taskData['analysis-target'],
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_pid,
            text: taskData.pid || '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.process_alias,
            text: taskData.process_name || '--',
            requier: '',
          },
          {
            key: this.i18n.sys.duration,
            text: taskData.duration,
            requier: '',
          },
          {
            key: this.i18n.sys.interval,
            text: Util.fixThouSeparator(taskData.interval),
            requier: '',
          },
          {
            key: this.i18n.sys.type,
            text: a,
            requier: '',
          },
        ];
        this.configList.push({
          key: this.i18n.process.trace,
          text:
            taskData['strace-analysis'] === 'enable'
              ? this.i18n.process.enable
              : this.i18n.process.disable,
          requier: '',
        });
        this.configList.push({
          key: this.i18n.process.tread,
          text:
            taskData.thread === 'enable'
              ? this.i18n.process.enable
              : this.i18n.process.disable,
          requier: '',
        });

        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_pid,
              text: item.task_param.pid || '--',
              requier: '',
            },
            {
              key: this.i18n.mission_create.process_alias,
              text: item.task_param.process_name || '--',
              requier: '',
            },
          ];
        });
      }
    } else if (analysisType.indexOf('system_lock') > -1) {
      if (taskData['analysis-target'].indexOf('Launch') > -1) {
        this.configList = [
          {
            key: this.i18n.mission_create.mode,
            text: taskData['analysis-target'],
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_app_path,
            text:
              taskData['app-dir'] !== undefined && taskData['app-dir'] !== ''
                ? taskData['app-dir']
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_parameters,
            text:
              taskData['app-parameters'] !== undefined &&
                taskData['app-parameters'] !== ''
                ? taskData['app-parameters']
                : '--',
            requier: '',
          },

          {
            key:
              this.i18n.common_term_task_crate_interval_ms +
              ' (' +
              (taskData.interval === '0.71'
                ? this.i18n.common_term_task_crate_us
                : this.i18n.common_term_task_crate_ms) +
              ')',
            text: Util.fixThouSeparator(
              taskData.interval !== undefined && taskData.interval !== ''
                ? taskData.interval === '0.71'
                  ? taskData.interval * 1000
                  : taskData.interval
                : '--'
            ),
            requier: '',
          },
          {
            key: this.i18n.micarch.label.typeItem,
            text: this.getLockType(taskData),
            requier: '',
          },
          {
            key: this.i18n.lock.form.functions_analysis,
            text: taskData.functionname.split('^_{,2}').join('') || '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_fh_path,
            text:
              taskData.assemblyLocation !== undefined &&
                taskData.assemblyLocation !== ''
                ? taskData.assemblyLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_c_path,
            text:
              taskData.sourceLocation !== undefined &&
                taskData.sourceLocation !== ''
                ? taskData.sourceLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.kcore,
            text: taskData.kcore
              ? this.i18n.process.enable
              : this.i18n.process.disable,
            requier: '',
          },
          {
            key: this.i18n.mission_create.collection_size,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_app_path,
              text: item.task_param['app-dir'] || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_parameters,
              text: item.task_param['app-parameters'] || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_bs_path,
              text: item.task_param.assemblyLocation || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_c_path,
              text: item.task_param.sourceLocation || '--',
              requier: '',
            },
          ];
        });
      } else if (taskData['analysis-target'].indexOf('Profile') > -1) {
        this.configList = [
          {
            key: this.i18n.common_term_task_crate_duration,
            text:
              taskData.duration !== undefined && taskData.duration !== ''
                ? taskData.duration
                : '--',
            requier: '',
          },
          {
            key:
              this.i18n.common_term_task_crate_interval_ms +
              ' (' +
              (taskData.interval === '0.71'
                ? this.i18n.common_term_task_crate_us
                : this.i18n.common_term_task_crate_ms) +
              ')',
            text: Util.fixThouSeparator(
              taskData.interval !== undefined && taskData.interval !== ''
                ? taskData.interval === '0.71'
                  ? taskData.interval * 1000
                  : taskData.interval
                : '--'
            ),
            requier: '',
          },
          {
            // 采样范围
            key: this.i18n.micarch.label.typeItem,
            text: this.getLockType(taskData),
            requier: '',
          },
          {
            // 分析函数
            key: this.i18n.lock.form.functions_label,
            text: taskData.functionname.split('^_{,2}').join('') || '--',
            requier: '',
          },
          {
            // 符号文件路径
            key: this.i18n.common_term_task_crate_fh_path,
            text:
              taskData.assemblyLocation !== undefined &&
                taskData.assemblyLocation !== ''
                ? taskData.assemblyLocation
                : '--',
            requier: '',
          },
          {
            // C/C++源文件路径
            key: this.i18n.common_term_task_crate_c_path,
            text:
              taskData.sourceLocation !== undefined &&
                taskData.sourceLocation !== ''
                ? taskData.sourceLocation
                : '--',
            requier: '',
          },
          {
            // 内核函数关联汇编代码
            key: this.i18n.mission_create.kcore,
            text: taskData.kcore
              ? this.i18n.process.enable
              : this.i18n.process.disable,
            requier: '',
          },
          {
            // 采集文件大小
            key: this.i18n.mission_create.collection_size,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_bs_path,
              text: item.task_param.assemblyLocation || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_c_path,
              text: item.task_param.sourceLocation || '--',
              requier: '',
            },
          ];
        });
      } else if (taskData['analysis-target'].indexOf('Attach') > -1) {
        this.configList = [
          {
            key: this.i18n.mission_create.mode,
            text: taskData['analysis-target'],
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_pid,
            text:
              taskData['target-pid'] !== undefined &&
                taskData['target-pid'] !== ''
                ? taskData['target-pid']
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.process_alias,
            text:
              taskData.process_name !== undefined &&
                taskData.process_name !== ''
                ? taskData.process_name
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_duration,
            text:
              taskData.duration !== undefined && taskData.duration !== ''
                ? taskData.duration
                : '--',
            requier: '',
          },
          {
            key:
              this.i18n.common_term_task_crate_interval_ms +
              ' (' +
              (taskData.interval === '0.71'
                ? this.i18n.common_term_task_crate_us
                : this.i18n.common_term_task_crate_ms) +
              ')',
            text: Util.fixThouSeparator(
              taskData.interval !== undefined && taskData.interval !== ''
                ? taskData.interval === '0.71'
                  ? taskData.interval * 1000
                  : taskData.interval
                : '--'
            ),
            requier: '',
          },
          {
            key: this.i18n.micarch.label.typeItem,
            text: this.getLockType(taskData),
            requier: '',
          },
          {
            key: this.i18n.lock.form.functions_analysis,
            text: taskData.functionname.split('^_{,2}').join('') || '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_fh_path,
            text:
              taskData.assemblyLocation !== undefined &&
                taskData.assemblyLocation !== ''
                ? taskData.assemblyLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.common_term_task_crate_c_path,
            text:
              taskData.sourceLocation !== undefined &&
                taskData.sourceLocation !== ''
                ? taskData.sourceLocation
                : '--',
            requier: '',
          },
          {
            key: this.i18n.mission_create.kcore,
            text: taskData.kcore
              ? this.i18n.process.enable
              : this.i18n.process.disable,
            requier: '',
          },
          {
            key: this.i18n.mission_create.collection_size,
            text: this.getSize(taskData),
            requier: '',
          },
        ];
        this.panelList = taskData.nodeConfig.map((item: any, index: any) => {
          return [
            {
              key: this.i18n.common_term_task_crate_pid,
              text:
                item.task_param['target-pid'] !== undefined &&
                  item.task_param['target-pid'] !== ''
                  ? item.task_param['target-pid']
                  : '--',
              requier: '',
            },
            {
              key: this.i18n.mission_create.process_alias,
              text:
                item.task_param.process_name !== undefined &&
                  item.task_param.process_name !== ''
                  ? item.task_param.process_name
                  : '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_bs_path,
              text: item.task_param.assemblyLocation || '--',
              requier: '',
            },
            {
              key: this.i18n.common_term_task_crate_c_path,
              text: item.task_param.sourceLocation || '--',
              requier: '',
            },
          ];
        });
      }
    } else if (analysisType === 'mem_access') {
      // 访存统计分析
      const formEl: any = new MemAccessForm();
      formEl.generateFormGroup();

      const { configList, panelList } = this.calcTemplateInfo(formEl, taskData);
      this.configList = configList;
      this.panelList = panelList;
    } else if (analysisType === 'miss_event') {
      // Miss事件统计
      const formEl: any = new MissEventForm();
      formEl.generateFormGroup();
      let listNotDisplay = ['analysisObject', 'analysisType'];
      if (
        !Object.prototype.hasOwnProperty.call(
          taskData.task_param,
          'perfDataLimit'
        )
      ) {
        listNotDisplay = ['analysisObject', 'analysisType', 'perfDataLimit'];
      }
      const { configList, panelList } = this.calcTemplateInfo(
        formEl,
        taskData,
        listNotDisplay
      );
      this.configList = configList;
      this.panelList = panelList;
    } else if (analysisType === 'falsesharing') {
      // 伪共享分析
      const formEl: any = new FalseSharingForm(this.i18n);
      formEl.generateFormGroup();

      const listNotDisplay = ['analysisObject', 'analysisMode', 'analysisType'];
      const { configList, panelList } = this.calcTemplateInfo(
        formEl,
        taskData,
        listNotDisplay
      );
      this.configList = configList;
      this.panelList = panelList;
    }

    // 采集信息
    const collectionInfo = [
      {
        // 是否是周期
        key: this.i18n.preSwitch.colectMethods,
        text: taskData.cycle
          ? this.i18n.preSwitch.duraColect
          : this.i18n.preSwitch.onceColect,
        requier: '',
      },
      {
        key: this.i18n.preSwitch.pointTime,
        text: taskData.targetTime,
        requier: '',
      },
      {
        key: this.i18n.preSwitch.pointDuration,
        text: this.handleColectDate(taskData),
        requier: '',
      },
    ];

    this.configList = [...this.configList, ...collectionInfo];
  }
  public close() { }
  // 处理采集日期
  public handleColectDate(obj: any) {
    return obj.cycle
      ? obj.cycleStart && obj.cycleStart
        ? obj.cycleStart.split('-').join('/') +
        '一' +
        obj.cycleStop.split('-').join('/')
        : ''
      : obj.appointment
        ? obj.appointment.split('-').join('/')
        : '';
  }
  handleObj(val: any) {
    let arr = [];
    arr = val.type.map((item: any) => {
      return this.taskType[item];
    });
    return arr.join(',');
  }

  public hasProperty(obj: any, key: any) {
    const bool = Object.prototype.hasOwnProperty.call(obj, key);
    return bool;
  }
}
