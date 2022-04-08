import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { MytipService } from '../../service/mytip.service';
import { Router } from '@angular/router';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { TaskDetailMode } from '../domain';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-mission-reservation-list',
  templateUrl: './mission-reservation-list.component.html',
  styleUrls: ['./mission-reservation-list.component.scss']
})
export class MissionReservationListComponent implements OnInit, OnDestroy {
  constructor(
    public i18nService: I18nService,
    private Axios: AxiosService,
    public taskService: ScheduleTaskService,
    public projectId: ScheduleTaskService,
    public router: Router,
    private tiMessage: MessageModalService,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    public mytip: MytipService) {
    this.i18n = this.i18nService.I18n();
    this.columns = [
      {
        title: this.i18n.common_term_task_name,
        sortKey: 'taskName', // 设置排序时按照源数据中的哪一个属性进行排序，
        display: true
      },
      {
        title: this.i18n.preTable.status,
        key: 'scheduleStatus', // 该列的 headfilter 要过滤的字段
        selected: [ // 该列的 headfilter 下拉选择项
        ],
        options: [{ // 该列的 headfilter 下拉选择项
          text: this.i18n.preTable.reserve,
          id: 'reserve',
        }, {
          text: this.i18n.preTable.running,
          id: 'running',
        }, {
          text: this.i18n.preTable.success,
          id: 'success',
        }, {
          text: this.i18n.preTable.fail,
          id: 'fail',
        }],
        display: true
      },
      {
        title: this.isDiagnose ?
          this.i18n.diagnostic.taskParams.diagnosticTarget
          : this.i18n.mission_create.analysisTarget,
        key: 'analysisTarget', // 该列的 headfilter 要过滤的字段
        selected: [// 该列的 headfilter 下拉选择项
        ],
        options: [{ // 该列的 headfilter 下拉选择项
          id: 'system',
          text: this.i18n.common_term_projiect_task_system,
        }, {
          id: 'application',
          text: this.i18n.common_term_task_crate_path,
        }],
        display: true
      },
      {
        title: this.i18n.common_term_task_analysis_type,
        key: 'analysisType', // 该列的 headfilter 要过滤的字段
        selected: [],
        options: [{ // 该列的 headfilter 下拉选择项
          id: 'C/C++ Program',
          text: this.i18n.mission_create.cPlusPlus,
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
        display: true && !this.isDiagnose
      },
      {
        title: this.i18n.common_term_projiect_name1,
        key: 'projectName', // 该列的 headfilter 要过滤的字段
        selected: [],
        options: [], // 该列的 headfilter 下拉选择项,
        display: true
      },
      {
        title: this.i18n.common_term_name,
        key: 'userName', // 该列的 headfilter 要过滤的字段
        selected: [],
        options: [], // 该列的 headfilter 下拉选择项,
        display: true
      },
      {
        title: this.i18n.preTable.action,
        sortKey: 'operate',
        display: true
      },
    ];
    this.taskNameObj = [
      {
        type: 'C/C++ Program',
        name: this.i18n.mission_create.cPlusPlus,
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
        type: 'mem_access_analysis',
        typeList: ['mem_access', 'miss_event', 'falsesharing'],
        name: this.i18n.mission_modal.memAccessAnalysis,
        cache_access: this.i18n.ddr.types.cache_access,
        ddr_access: this.i18n.ddr.types.ddr_access
      },
      {
        type: 'ioperformance',
        name: this.i18n.mission_create.io,
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
        name: this.i18n.network_diagnositic.analysis_type
      },
      {
        type: 'storageio_diagnostic',
        name: this.i18n.storageIo.analysis_type,
      }
    ];
  }

  @ViewChild('multipleDeleteMask') multipleDeleteMask: any;
  public checkedList: Array<TiTableRowData> = []; // 默认选中项
  public checkedListOk: Array<TiTableRowData> = [];
  public i18n: any;
  public openAlert = false;
  public labelAlert = '';
  public isAdminNum = 6;
  dismissOnTimeout = 1000;

  // 表格数据
  public displayedCopy: Array<TiTableRowData> = [];
  set displayed(val) {
    this.displayedCopy = val;
  }
  get displayed() {
    return this.displayedCopy;
  }
  public displayedOk: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public srcDataOk: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];
  public completeData: any = []; // 处理好的完整数据
  // 判断当前语言
  public lang = sessionStorage.getItem('language');
  public taskNameObj: any;
  // 判断是否显示操作列
  public userRole: any = sessionStorage.getItem('role');
  public userId: any = sessionStorage.getItem('loginId');
  public currentList = false;
  public currentUserId: any;
  public taskData: any = [];
  public taskDataModify: any;
  public getProject: any;
  public count = 0;
  public nodataTips = '';
  public ifAskData = false;
  public checkColum = '8%';
  public listColum = '17';
  // 保存任务列表长度
  public totalNumber = 0;
  public currentPage = 1;
  public pageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 30, 40, 50],
    size: 10,
  };
  public detailTarget = TaskDetailMode.RESERVATION;
  public isLoading = false;
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  // 是否显示修改弹框
  showModifyModal = false;

  ngOnInit() {
    this.nodataTips = this.i18n.loading;
    if (this.isDiagnose) {
      this.columns[2].options = [];
      this.columns[3].options = [];
    }
    this.srcData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
      // 已经做过的，tiny就不再做了
      // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
      // 本示例中，开发者设置了排序特性，且对源数据未进行排序处理，因此tiny会对数据进行排序处理
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

    // 获取预约任务列表
    this.getPreTableList();

    if (!this.ifAskData) {
      this.nodataTips = this.i18n.common_term_task_nodata2;
    }
  }
  ngOnDestroy() {
    this.srcData.data = [];
    this.srcDataOk.data = [];
  }

  // 筛选数据
  public onMyChange() {
    this.srcData.data = this.completeData.filter((val: any) => {
      const t1 = this.ifTrue(val.scheduleStatus, this.columns[1].selected);
      const t2 = this.ifTrue(val.analysisTarget, this.columns[2].selected);
      const t3 = this.ifTrue(val.analysisType, this.columns[3].selected);
      const t4 = this.ifTrue(val.projectName, this.columns[4].selected);
      const t5 = this.ifTrue(val.userName, this.columns[5].selected);
      const test = this.isDiagnose ? t1 && t4 : t1 && t2 && t3 && t4 && t5;
      return test;
    });
    this.cdr.detectChanges();
    this.totalNumber = this.srcData.data.length;
    if (this.totalNumber === 0) {
      this.nodataTips = this.i18n.common_term_task_nodata2;
    }
    // 更新选中列表
    const checkedListAfter = this.srcData.data.filter((el: any) => {
      const isThat = this.checkedList.find(item => {
        return item.taskName === el.taskName;
      });
      return isThat;
    });
    this.checkedList = checkedListAfter;
  }
  public ifTrue(item: any, data: any) {
    let val = false;
    data.forEach((ele: any) => {
      if (item === ele.text) {
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
        return val.taskName === el.taskName;
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

    const taskIdArr = this.checkedListOk.map(val => {
      return val.taskId;
    });
    const params = this.isDiagnose
      ? { data: { scheduletask_ids: taskIdArr, analysisType: 'memory_diagnostic' } }
      : { data: { scheduletask_ids: taskIdArr } };
    this.Axios.axios.delete('/schedule-tasks/batch-delete/', params)
      .then((res: any) => {
        this.mytip.alertInfo({ type: 'success', content: this.i18n.tip_msg.delete_ok, time: 3500 });
        this.closeDelete();
        this.getPreTableList();
      }).catch(() => {
        this.isLoading = false;
      });
  }
  // 展开详情
  public beforeToggle(row: TiTableRowData, i: any): void {
    // 展开时
    if (!row.showDetails) {
      row.showDetails = !row.showDetails;
      setTimeout(() => {
        if (this.userRole === 'Admin') {
          this.elementRef.nativeElement.querySelectorAll('.colsTd').forEach((el: any) => {
            el.colSpan = this.isDiagnose ? '8' : '9';
          });
        } else {
          this.elementRef.nativeElement.querySelectorAll('.colsTd').forEach((el: any) => {
            el.colSpan = this.isDiagnose ? '7' : '8';
          });
        }
      });

    } else {
      // 收起时直接收起
      row.showDetails = !row.showDetails;
    }
  }

  // 接收从预约传来的值
  public getScheduleTaskId() {
    this.getProject = this.projectId.projectId.subscribe(id => {
      if (id > 0) {
        this.getPreTableList();
      }
    });
  }
  // 获取列表数据   存储io
  public getPreTableList() {
    this.isLoading = true;
    this.currentList = false;
    this.ifAskData = true;
    this.nodataTips = this.i18n.loading;
    const queryParams = this.isDiagnose ? '?analysis-type=memory_diagnostic' : '';
    const url = '/schedule-tasks/batch/' + queryParams;
    this.Axios.axios.get(url, { headers: { showLoading: false } }).then((res: any) => {
      this.isLoading = false;
      this.currentUserId = res.data.ownerId;
      this.srcData.data = res.data.scheduleTaskList.map((item: any) => {
        if (this.userId === item.userId || this.userRole === 'Admin') {
          this.currentList = true;
        }
        return {
          taskName: item.taskName,
          scheduleStatus: this.showStatus(item),
          data: JSON.parse(item.taskInfo),
          taskId: item.taskId,
          analysisType: this.handleTaskType(item),
          analysisTarget: this.handleTaskTarget(item),
          ownerId: item.userId,
          projectId: item.projectId,
          projectName: item.projectName,
          userName: item.userName,
        };
      });
      this.totalNumber = res.data.total;
      // 通过ScheduleTaskService实例将获取任务total发送给header中的预约任务按钮
      if (this.totalNumber === 0) {
        this.nodataTips = this.i18n.common_term_task_nodata2;
      }
      // 保留处理好的完整数据,方便筛选
      this.completeData = JSON.parse(JSON.stringify(this.srcData.data));
      this.onCheckTaskInfo();


    }).catch((error: any) => {
      this.isLoading = false;
      this.nodataTips = this.i18n.common_term_task_nodata2;
    });
  }

  // 修改预约任务
  public modify(row: any) {
    this.taskDataModify = row;
    this.showModifyModal = true;
  }

  // 删除按钮   存储io
  public delete(row: any) {
    const url = '/schedule-tasks/' + row.taskId + '/';
    const self = this;
    const params = this.isDiagnose
      ? { data: { analysisType: 'memory_diagnostic' } }
      : { data: {} };
    this.tiMessage.open({
      type: 'warn',
      modalClass: 'delete-reservation',
      title: this.i18n.common_term_delete_title_appointment,
      content: this.i18n.sureDeleteOne + ' ' + row.taskName + '?',
      close() {
        self.Axios.axios.delete(url, params).then((res: any) => {
          self.mytip.alertInfo({ type: 'success', content: self.i18n.tip_msg.delete_ok, time: 3500 });
          self.getPreTableList();
        });
      },
      okButton: {
        text: this.i18n.common_term_operate_ok,
        primary: false,
        autofocus: false,
      },
      cancelButton: {
        text: this.i18n.common_term_operate_cancel,
        primary: true,
        autofocus: true,
      }
    });

  }
  // 关闭修改弹窗等,更新预约任务数据
  public handleUpdataPretable(e: string): void {
    if (e === 'on') {
      this.getPreTableList();
    }
    this.showModifyModal = false;
  }
  // 状态
  public showStatus(row: any) {
    switch (row.scheduleStatus) {
      case 'reserve':
        return this.i18n.preTable.reserve;
      case 'running':
        return this.i18n.preTable.running;
      case 'success':
        return this.i18n.preTable.success;
      case 'fail':
        return this.i18n.preTable.fail;
      default:
        return '';
    }
  }
  // 创建时间
  public handleTime(row: any) {
    return row.cycle ? row.cycleStart.split('T')[0].split('-').join('/')
      + ' 一 ' + row.cycleStop.split('T')[0].split('-').join('/')
      : row.appointment.split('T')[0].split('-').join('/');
  }
  // 创建日期
  public handleCreateTime(row: any) {
    return row.createdTime.split('T')[0].split('-').join('/') + ' ' + row.createdTime.split('T')[1].split('.')[0];
  }
  // 任务类型
  public handleTaskType(row: any) {
    let returnValue = '--';
    if (this.taskNameObj != null) {
      Object.keys(this.taskNameObj).forEach(item => {
        const analysisType = this.taskNameObj[item];
        if (row.analysisType === analysisType.type
          || analysisType.typeList && analysisType.typeList.includes(row.analysisType)) {
          returnValue = analysisType.name;
        }
      });
    }
    return returnValue;
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
  public handleTaskTarget(row: any) {
    const taskInfo = JSON.parse(row.taskInfo);
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
    const analysisTarget = this.getAnalysisTarget({ taskInfo });
    if (['Launch Application', 'Attach to Process'].includes(analysisTarget)) {
      return this.i18n.common_term_task_crate_path;
    } else {
      return this.i18n.common_term_projiect_task_system;
    }
  }
  // 采样类型
  public handleAnalysisType(row: any) {
    const analysis: any = [];
    const obj = Object.assign({}, JSON.parse(row.taskInfo));
    if (Object.prototype.hasOwnProperty.call(obj, 'analysis-target')) {
      return obj['analysis-target'];
    } else {
      const arr = obj.task_param.type;
      if (this.taskNameObj != null) {
        for (const item of Object.keys(this.taskNameObj)) {
          if (row.analysisType === this.taskNameObj[item].type) {
            arr.forEach((items: any) => {
              analysis.push(this.taskNameObj[item][items]);
            });
            return analysis.sort().join('、');
          }
        }
      }
    }
  }
  // 状态小圆点
  public statusFormat(status: string): string {
    let statusClass = '';
    switch (status) {
      case this.i18n.preTable.reserve:
        statusClass = 'reserve-icon';
        break;
      case this.i18n.preTable.running:
        statusClass = 'reserve-icon';
        break;
      case this.i18n.preTable.success:
        statusClass = 'analyzing-icon';
        break;
      case this.i18n.preTable.fail:
        statusClass = 'failed-icon';
        break;
      default:
        statusClass = 'success-icon';
        break;
    }
    return statusClass;
  }

  public async onCheckTaskInfo() {
    const projectList: any = []; // 从任务列表里获取工程id及列表
    const userNameList: any = [];
    this.srcData.data.forEach((el: any) => {
      if (!projectList.find((val: any) => el.projectId === val.id)) {
        projectList.push({ id: el.projectId, text: el.projectName });
      }
      if (!userNameList.find((val: any) => el.userName === val.id)) {
        userNameList.push({ id: el.userName, text: el.userName });
      }
    });
    this.columns[4].options = JSON.parse(JSON.stringify(projectList));
    this.columns[5].options = JSON.parse(JSON.stringify(userNameList));
    // 将下拉选择框全选
    this.columns.forEach(val => {
      if (Object.prototype.hasOwnProperty.call(val, 'options')) {
        val.selected = [...val.options];
      }
    });
    projectList.forEach((item: any) => {
      this.isLoading = true;
      const url = this.isDiagnose
        ? `diagnostic-project/${encodeURIComponent(item.id)}/info/`
        : `projects/${encodeURIComponent(item.id)}/info/`;
      this.Axios.axios.get(url, { headers: { showLoading: false } }).then((res: any) => {
        this.isLoading = false;
        this.taskData = [];
        this.srcData.data.forEach((val: any) => {
          if (val.projectId === item.id) {
            const data1: any = [];
            data1.push(val.data);
            const nodeIdArr = data1[0].nodeConfig.map((param: any, index: any) => {
              return param.nodeId;
            });
            res.data.nodeList.forEach((param: any) => {
              const nodeIdIndex = nodeIdArr.indexOf(param.id);
              if (nodeIdIndex > -1) {
                data1[0].nodeConfig[nodeIdIndex].nodeName = param.nickName;
                data1[0].nodeConfig[nodeIdIndex].nodeIp = param.nodeIp;
              }
            });
          }
        });
      }).catch(() => {
        this.isLoading = false;
      });

    });
  }
}
