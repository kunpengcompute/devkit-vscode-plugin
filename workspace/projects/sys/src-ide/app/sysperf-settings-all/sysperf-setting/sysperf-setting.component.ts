import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MytipService } from '../../service/mytip.service';
import { I18nService } from '../../service/i18n.service';
import {
  VscodeService,
  COLOR_THEME,
  HTTP_STATUS,
  currentTheme,
} from '../../service/vscode.service';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
  TiModalService,
  Util,
} from '@cloud/tiny3';
import { SysPerfScoll } from './sysperf-setting-scroll.component';
import { SysPerfAppointTaskSet } from './sysperf-setting-appointtask.component';
import { MessageService } from '../../service/message.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-sysperf-setting',
  templateUrl: './sysperf-setting.component.html',
  styleUrls: ['./sysperf-setting.component.scss'],
})
export class SysperfSettingComponent implements OnInit {
  // 静态实例常量
  public static instance: SysperfSettingComponent;
  @ViewChild('largeModifySchedule', { static: false }) largeModifySchedule: any;
  constructor(
    public i18nService: I18nService,
    public router: Router,
    private route: ActivatedRoute,
    public vscodeService: VscodeService,
    public mytip: MytipService,
    public sanitizer: DomSanitizer,
    private tiModal: TiModalService,
    private msgService: MessageService
  ) {
    SysperfSettingComponent.instance = this;
    this.i18n = this.i18nService.I18n();
    this.sysPerfScroll = new SysPerfScoll(i18nService, vscodeService);
    this.sysPerfAppointTaskSet = new SysPerfAppointTaskSet(
      i18nService,
      vscodeService
    );
    this.columAppointTask = [
      {
        title: '',
        prop: 'detailsIcon',
      },
      {
        title: '',
        prop: 'checkbox',
      },
      {
        title: this.i18n.common_term_task_name,
        prop: 'taskName',
        width: '10%',
      },
      {
        title: this.i18n.plugins_term_project_name,
        prop: 'projectName',
        width: '15%',
        selected: [],
        options: [],
        generateOptionsBasedOnData: true,
      },
      {
        title: this.i18n.preTable.status,
        prop: 'scheduleStatus',
        width: '15%',
        selected: [
          this.i18n.preTable.reserve,
          this.i18n.preTable.running,
          this.i18n.preTable.success,
          this.i18n.preTable.fail,
        ],
        options: [
          this.i18n.preTable.reserve,
          this.i18n.preTable.running,
          this.i18n.preTable.success,
          this.i18n.preTable.fail,
        ],
      },
      {
        title: this.i18n.plugins_perf_tip_sysSet.analysisTarget,
        prop: 'analysisTarget',
        width: '15%',
        selected: [
          this.i18n.common_term_projiect_task_system,
          this.i18n.common_term_task_crate_path,
        ],
        options: [
          this.i18n.common_term_projiect_task_system,
          this.i18n.common_term_task_crate_path,
        ],
      },
      {
        title: this.i18n.plugins_perf_tip_sysSet.common_term_task_analysis_type,
        prop: 'analysisType',
        width: '25%',
        selected: [
          this.i18n.mission_create.resSchedule,
          this.i18n.mission_modal.cProgramAnalysis,
          this.i18n.mission_modal.sysPowerAllAnalysis,
          this.i18n.micarch.selct_title,
          this.i18n.mission_modal.memAccessAnalysis,
          this.i18n.mission_modal.processAnalysis,
          this.i18n.mission_modal.syslockAnalysis,
          this.i18n.mission_create.io,
          this.i18n.mission_create.hpc,
        ],
        options: [
          this.i18n.mission_create.resSchedule,
          this.i18n.mission_modal.cProgramAnalysis,
          this.i18n.mission_modal.sysPowerAllAnalysis,
          this.i18n.micarch.selct_title,
          this.i18n.mission_modal.memAccessAnalysis,
          this.i18n.mission_modal.processAnalysis,
          this.i18n.mission_modal.syslockAnalysis,
          this.i18n.mission_create.io,
          this.i18n.mission_create.hpc,
        ],
      },
      {
        title: this.i18n.preTable.userName,
        width: '15%',
        prop: 'userName', // 该列的 headfilter 要过滤的字段
        selected: [],
        options: [], // 该列的 headfilter 下拉选择项,
      },
      {
        title: this.i18n.plugins_perf_title_columsOperate,
        prop: 'operate',
        width: '150px',
        fixed: 'right'
      },
    ];
    if (this.userRole !== 'Admin') {
      this.columAppointTask.splice(7, 1);
    }
  }
  public userRole: any = sessionStorage.getItem('role');
  public i18n: any;
  public themeDark = COLOR_THEME.Dark;
  public themeLight = COLOR_THEME.Light;
  public currTheme: any;
  public sysPerfScroll: SysPerfScoll;
  public sysPerfAppointTaskSet: SysPerfAppointTaskSet;
  public projects: any;
  public modeProcess: any;

  // 判断是否是管理员或普通用户
  public userRoleFlag = false;

  // 预约任务管理
  private tempDataAppointTask: any;
  public srcAppointTaskData: TiTableSrcData;
  private dataAppointTask: Array<TiTableRowData> = [];
  public columAppointTask: Array<TiTableColumns> = [];
  public image = {
    dark: './assets/img/projects/dark-noproject.png',
    light: './assets/img/projects/light-noproject.png',
  };
  // 修改预约任务
  public modifyScheduleModel: any;
  @ViewChild('modifyschedule', { static: false }) modifyschedule: any;
  // 删除单条预约任务
  @ViewChild('deleteAppointTaskModal', { static: false })
  deleteAppointTaskModal: any;
  public willDeletedAppointTask: any;
  // -- 批量删除预约任务 --
  @ViewChild('batchDeleteAppointTaskModalComponent', { static: false })
  batchDeleteAppointTaskModalComponent: any;
  public batchDeleteAppointTaskModal: any;
  // 判断当前是否加载完毕
  public isInited = false;
  public anasyname: any;
  public taskData: any;
  // 手动查询，off时不影响token生命周期
  public autoFlag = 'off';

  // 导入导出任务列表
  @ViewChild('importExportTaskList', { static: false })
  importExportTaskList: any;

  public filterImgStatus: any = {
    projectName: './assets/img/filterNormal.svg',
    scheduleStatus: './assets/img/filterNormal.svg',
    analysisTarget: './assets/img/filterNormal.svg',
    analysisType: './assets/img/filterNormal.svg',
  };
  public filterImgStatusList: any = {
    normal: './assets/img/filterNormal.svg',
    hover: './assets/img/filterHover.svg',
    click: './assets/img/filterClick.svg',
  };
  public toolType: ToolType;
  public ToolType = ToolType;

  public systemConfigText = '';

  /**
   * 组件初始化
   */
  ngOnInit() {
    this.toolType = sessionStorage.getItem('toolType') as ToolType;

    if (this.toolType === ToolType.DIAGNOSE) {
      this.columAppointTask[5].options = [];
      this.columAppointTask[5].selected = [];
      this.columAppointTask[6].options = [];
      this.columAppointTask[6].selected = [];
      this.systemConfigText = this.i18n.system_config.diagnose_config;
    } else if (this.toolType === ToolType.TUNINGHELPER) {
      this.systemConfigText = this.i18n.system_config.tuning_assistant_config;
    } else {
      this.systemConfigText = this.i18n.system_config.system_tuning;
    }

    // 接收通知刷新项目预约任务数据列表
    this.msgService.getMessage().subscribe((msg) => {
      if (msg && msg.type && msg.type.indexOf('appointTaskManager') !== -1) {
        this.initProjects(true);
      }
    });

    // 跳转至页面指定位置
    this.route.queryParams.subscribe((data) => {
      if (!this.isInited) {
        setTimeout(() => {
          this.jumpScroll(data.innerItem);
          if (
            data.innerItem === 'itemImportAndExportTask' &&
            data.isShowDeletedTip === 'true'
          ) {
            this.importExportTaskList.showTaskDeletedMessage(
              JSON.parse(data.taskInfo)
            );
          }
        }, 1000);
      }
    });

    this.msgService.getMessage().subscribe((msg) => {
      if (msg.value === 'sysperfSettings') {
        this.jumpScroll(msg.type);
      }
    });

    // 注册滚动条事件
    this.ngScroll();

    // 用户角色判断
    this.userRoleFlag = VscodeService.isAdmin();

    // 初始化预约任务数据
    this.initProjects(false);

    // 初始化当前主题
    this.currTheme = currentTheme();

    // 监听主题变更事件
    this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
      this.currTheme = msg.colorTheme;
      this.highLightMenu();
    });

    // 页面加载完毕
    this.isInited = true;
  }

  /**
   *  时刻监听主题切换，适配高亮左侧菜单
   */
  public highLightMenu() {
    this.sysPerfScroll.highLightMenu(this);
  }

  /**
   * 查询当前存在的工程
   */
  public initProjects(updataFlag: any) {
    const url =
      this.toolType === ToolType.DIAGNOSE
        ? '/memory-project/' + '?auto-flag=on' + '&date=' + Date.now()
        : '/projects/?auto-flag=' + this.autoFlag + '&date=' + Date.now();
    const option = {
      url,
      method: 'GET',
    };
    this.vscodeService.get(option, (data: any) => {
      this.autoFlag = 'on';
      const loginId = String(self.webviewSession.getItem('loginId'));
      const role = self.webviewSession.getItem('role');
      const projects = data.data.projects;
      if (projects && projects.length > 0) {
        if (role === 'Admin') {
          this.projects = data.data.projects;
        } else {
          const curRoleProData = [];
          for (const proItem of data.data.projects) {
            if (proItem.ownerId === loginId) {
              curRoleProData.push(proItem);
            }
          }
          this.projects = curRoleProData;
        }
        this.initAppointTaskItems(updataFlag);
      }
    });
  }

  /**
   * 滚动条跳转
   * @param：innerItem
   */
  public jumpScroll(innerItem: string) {
    this.sysPerfScroll.jumpScroll(innerItem, this);
  }

  /**
   * 左侧菜单跳转内容框内滚动位置
   */
  scrollToItem() {
    this.sysPerfScroll.scrollToItem(this);
  }

  /**
   * 主题颜色适配
   * @param:setList
   * @param:scrollLocationIncontent
   */
  updateSetThemeColor(setList: any, scrollLocationIncontent: any) {
    this.sysPerfScroll.updateSetThemeColor(
      setList,
      scrollLocationIncontent,
      this
    );
  }

  /**
   * 注册指定组件滚动条事件
   */
  ngScroll() {
    document.getElementById('content').addEventListener('scroll', () => {
      this.scrollToItem();
      Util.trigger(document, 'tiScroll');
    });
  }

  /**
   * 表格过滤列进行筛选
   * @ param colName
   * @ param colSelected
   */
  onSelect() {
    if (this.tempDataAppointTask) {
      this.sysPerfAppointTaskSet.displayAppointTask = this.tempDataAppointTask;
      this.sysPerfAppointTaskSet.displayAppointTask =
        this.tempDataAppointTask.filter((row: any) => {
          for (const column of this.columAppointTask) {
            if (column.selected && column.selected.length > 0) {
              if (!column.selected.includes(row[column.prop])) {
                return false;
              }
            }
          }

          return true;
        });
    }
  }
  /**
   * 弹出批量删除页面
   */
  popBatchDeleteModal() {
    const self = this;
    const checkedList = this.sysPerfAppointTaskSet.displayAppointTask.filter(
      (item: any) =>
        this.sysPerfAppointTaskSet.checkAppointTaskList.includes(item.taskId)
    );
    const checkeds = JSON.parse(JSON.stringify(checkedList));
    const checkId = this.sysPerfAppointTaskSet.checkAppointTaskList;

    this.batchDeleteAppointTaskModal = this.tiModal.open(
      this.batchDeleteAppointTaskModalComponent,
      {
        // 定义id防止同一页面出现多个相同弹框
        id: 'batchDeleteAppointTaskModalComponent',
        modalClass: 'batchDeleteAppointTaskModalComponent nodeManagementModal',
        context: {
          columns: [
            {
              title: '',
              prop: 'checkbox',
            },
            {
              title: self.i18n.common_term_task_name,
              prop: 'taskName',
            },
            {
              title: self.i18n.plugins_term_project_name,
              prop: 'projectName',
            },
            {
              title: self.i18n.plugins_perf_tip_sysSet.status,
              prop: 'scheduleStatus',
            },
            {
              title: self.i18n.plugins_perf_tip_sysSet.analysisTarget,
              prop: 'analysisTarget',
            },
            {
              title:
                self.i18n.plugins_perf_tip_sysSet
                  .common_term_task_analysis_type,
              prop: 'analysisType',
            },
          ],
          displayed: [],
          checkId,
          srcData: {
            data: [...checkeds],
            state: {
              searched: false,
              sorted: false,
              paginated: false,
            },
          },
          batchDeleteAppointTask: (context: any) => {
            const taskIdArr = context.checkId;

            const params =
              this.toolType === ToolType.DIAGNOSE
                ? {
                  scheduletask_ids: taskIdArr,
                  analysisType: 'memory_diagnostic',
                }
                : { scheduletask_ids: taskIdArr };
            this.vscodeService.delete(
              {
                url: '/schedule-tasks/batch-delete/',
                params,
              },
              (res: any) => {
                const reultSuccess = 'SysPerf.Success';
                if (res.code === reultSuccess) {
                  self.initAppointTaskItems(false);
                  context.close();
                  self.vscodeService.showInfoBox(
                    self.i18n
                      .plugins_sysperf_message_batch_delete_AppointTask_ok,
                    'info'
                  );
                  this.sysPerfAppointTaskSet.checkAppointTaskList = [];
                } else {
                  self.vscodeService.showInfoBox(
                    self.i18n
                      .plugins_sysperf_message_batch_delete_AppointTask_fail,
                    'error'
                  );
                }
              }
            );
          },
        },
        draggable: false,
      }
    );
  }

  /**
   * 修改预约任务
   * @param row 表格行
   */
  public modifyAppointTask(row: any) {
    this.taskData = row.data;
    this.anasyname = row.data['analysis-type'] || row.data.analysisType;
    switch (this.anasyname) {
      case 'netio_diagnostic':
      case 'storageio_diagnostic':
        this.largeModifySchedule.open(row);
        break;
      default:
        this.modifyschedule.open(row);
        break;
    }
  }

  /**
   * 打开删除预约任务弹窗
   * @param projectId 项目ID
   * @param taskId 预约任务ID
   */
  public openDeleteAppointTaskModal(row: any) {
    this.willDeletedAppointTask = row;
    this.deleteAppointTaskModal.Open();
  }

  /**
   * 确定删除预约任务
   */
  public deleteAppointTaskOk() {
    const row = JSON.parse(JSON.stringify(this.willDeletedAppointTask));
    this.willDeletedAppointTask = {};
    const params =
      this.toolType === ToolType.DIAGNOSE
        ? { analysisType: 'memory_diagnostic' }
        : {};
    const option = {
      url: '/schedule-tasks/' + row.taskId + '/',
      params,
    };

    this.vscodeService.delete(option, (data: any) => {
      if (data.status === HTTP_STATUS.HTTP_409_CONFLICT) {
        this.vscodeService.showInfoBox(data.message, 'error');
      } else {
        this.vscodeService.showInfoBox(
          this.i18nService.I18nReplace(
            this.i18n.plugins_term_delete_single_AppointTask_ok,
            { 0: row.taskName }
          ),
          'info'
        );
      }

      //  刷新预约任务管理
      this.initAppointTaskItems(false);
      this.deleteAppointTaskModal.Close();
    });
  }

  /**
   * 初始化预约任务管理数据
   */
  public async initAppointTaskItems(updateFlag: any) {
    this.dataAppointTask = [];
    const appointTaskSet: any =
      await this.sysPerfAppointTaskSet.getAppointTaskItems();
    if (appointTaskSet.length > 0) {
      for (const task of appointTaskSet) {
        if (typeof task.showDetails === 'undefined') {
          task.projectName = task.projectName;
          task.projectId = task.projectId;
          const isExist = this.dataAppointTask.some((item): any => {
            if (item.taskId === task.taskId) {
              return true;
            }
          });

          // 查找之前是展开状态的任务
          const oldTask = this.sysPerfAppointTaskSet.displayAppointTask.find(
            (item) => {
              return item.taskId === task.taskId && item.showDetails;
            }
          );

          // 之前的列表中存在这个任务，且任务是展开详情状态
          if (oldTask) {
            task.showDetails = true;
          }
          if (!isExist) {
            this.dataAppointTask.push(task);
          }

          // 如果需要由数据来生成需要列的筛选列表
          for (const column of this.columAppointTask) {
            if (column.generateOptionsBasedOnData && column.options) {
              if (!column.options.includes(task[column.prop])) {
                column.options.push(task[column.prop]);
                column.selected.push(task[column.prop]);
              }
            }
          }
        }
      }
    }
    this.sysPerfAppointTaskSet.displayAppointTask = this.dataAppointTask;

    this.updataAppointData(updateFlag);
  }

  /**
   * 更新筛选预约任务数据
   */
  public updataAppointData(updateFlag: any) {
    if (this.sysPerfAppointTaskSet.displayAppointTask) {
      this.tempDataAppointTask = JSON.parse(
        JSON.stringify(this.sysPerfAppointTaskSet.displayAppointTask)
      );
    }
    if (updateFlag) {
      this.onSelect();
    } else {
      this.srcAppointTaskData = {
        data: this.sysPerfAppointTaskSet.displayAppointTask,
        state: {
          searched: false,
          sorted: false,
          paginated: false,
        },
      };
    }
  }

  /**
   * 刷新图标状态变化
   * @param status 图标状态
   * @param prop 列名
   */
  public imgStatusChange(status: string, prop: string) {
    this.filterImgStatus[prop] = this.filterImgStatusList[status];
  }
}
