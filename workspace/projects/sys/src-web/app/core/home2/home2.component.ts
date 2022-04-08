import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { openHelper } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-record-detail/tuninghelper-record-detail.component';
import { openDataDetailPanal } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-task-detail/tuninghelper-task-detail.component';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { judgeScene } from 'projects/sys/src-web/app/util';
import { AnalysisScene, LaunchRunUser } from 'projects/sys/src-web/app/domain';
import * as Utils from 'projects/sys/src-web/app/util';

import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Renderer2,
  ViewChildren,
  OnDestroy,
  ElementRef,
  AfterContentChecked,
} from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { ScheduleTaskService } from 'projects/sys/src-web/app/service/schedule-task.service';
import { Util } from '@cloud/tiny3';
import { UserGuideService } from 'projects/sys/src-web/app/service/user-guide.service';
import { Home2MainMsgService } from './service/home2-main-msg.service';
import { PartialObserver, Subscription } from 'rxjs';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { RunUserDataObj } from 'projects/sys/src-ide/app/mission-create/mission-domain';
import { ToolType } from 'projects/domain';
import { WebviewPanelService } from './service/webview-panel.service';
import {
  TuningSysMessageService,
  TuningSysMessageDetail,
  TuningSysMessageType,
  TuningSysCreateTaskData,
  TuningSysViewTaskData,
  ViewAssociatedReportData,
} from 'sys/model/service';

@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.scss'],
})
export class Home2Component implements OnInit, AfterViewInit, OnDestroy, AfterContentChecked {
  private url: any;
  constructor(
    private renderer2: Renderer2,
    private el: ElementRef,
    public i18nService: I18nService,
    private urlService: UrlService,
    public mytip: MytipService,
    public leftShowService: LeftShowService,
    private msgService: MessageService,
    private Axios: AxiosService,
    private tiMessage: MessageModalService,
    public scheduleTaskServer: ScheduleTaskService,
    public userGuide: UserGuideService,
    private home2MainMsgService: Home2MainMsgService,
    private panelService: WebviewPanelService,
    private tuningSysMessageService: TuningSysMessageService,
  ) {
    this.url = this.urlService.Url();
    this.i18n = this.i18nService.I18n();
  }
  public leftState = true;
  public maxLeftHeight = '100%';
  public tabList: any = [];
  public treeData: any = [];
  public i18n: any;
  public showTabArrow = false;
  public tanslateX = 0; // 当前tab页签移动量
  public subscription: Subscription;
  private openHelper: Subscription;
  private openDataDetailPanal: Subscription;
  private tuningHelperSub: Subscription;
  public userInfo = {
    role: '',
    id: '',
  };
  public tabActive = 'project';
  public listenerFn: any; // 解决拖动滚动条会导致tiny下拉框错位的问题
  public scenes: AnalysisScene;
  public ToolType = ToolType;
  public toolType: ToolType = sessionStorage.getItem('toolType') as ToolType;
  @ViewChild('Tree') Tree: any;
  @ViewChild('linkage') linkage: any;
  @ViewChild('compare') compare: any;
  @ViewChildren('indexContent') indexContent: any;
  @ViewChild('tuninghelper') tuninghelper: any;
  @ViewChild('deleteModal') deleteModal: any;
  public tabCover = {
    COUVER(taskId: any, item: any) {
      if (this.tabList.length > 0) {
        this.tabList = this.tabList.filter((items: any) => {
          return items.taskId !== taskId.id;
        });
        let i = 0;
        this.tabList.forEach((tab: any) => {
          if (tab.active === false) {
            i++;
          }
        });
        if (i === this.tabList.length && this.tabList.length > 0) {
          this.tabList[0].active = true;
        }
        this.Tree.updateProjectDetail([item]); // 任务操作成功之后需要调用
      }
    },
    DELETEPROJECT(taskIdArr: any) {
      if (this.tabList.length > 0) {
        this.tabList = this.tabList.filter((items: any) => {
          if (items.taskId && taskIdArr.indexOf(items.taskId) === -1) {
            return items;
          }
        });
        let i = 0;
        this.tabList.forEach((tab: any) => {
          if (tab.active === false) {
            i++;
          }
        });
        if (i === this.tabList.length && this.tabList.length > 0) {
          this.tabList[0].active = true;
        }
      }
    },
  };
  // 修改预约任务
  public scheduleTask: any;
  private closeTabSub: Subscription;
  private panelSub: Subscription;

  ngOnInit() {
    // tab 关闭的通知流
    const closeTabObserver: PartialObserver<any> = {
      next: ({ detail, index }) => {
        if (detail.taskType === 'optimization' || detail.taskType === 'tuninghelperInfoLog') {
          this.tuningHelperCloseTabAndOpenDetail(detail, index);
        } else {
          this.closeTabAndOpenDetail(detail, index);
        }
      }
    };
    // 关闭label页签
    this.closeTabSub = this.home2MainMsgService.closeTabLister$.subscribe(closeTabObserver);
    // 由调优记录路径树状图打开调优助手分析报告
    this.openHelper = openHelper.subscribe((msg) => {
      this.openTuninghelper(msg);
    });
    // 由结果详情页打开查看详细数据界面
    this.openDataDetailPanal = openDataDetailPanal.subscribe((msg: any) => {
      this.openDataDetailHepler(msg);
    });
    this.userInfo.id = sessionStorage.getItem('loginId');
    this.userInfo.role = sessionStorage.getItem('role');
    this.subscription = this.msgService.getMessage().subscribe((msg): any => {

      if (msg.function === 'updateTabProjectName') {
        this.tabList.forEach((tabItem: any) => {
          if (tabItem.projectName === msg.oldName) {
            tabItem.projectName = msg.newName;
            if (tabItem.refreshItem) {
              tabItem.refreshItem.projectName = msg.newName;
            }
          }
        });

      }
      if (msg.function === 'functionTab') {
        const item = msg.msg;
        const res = this.tabList.find((tab: any) => {
          return (
            tab.displayType === 'sourceCodeDisplay' &&
            tab.title === item.functionName &&
            tab.taskId === item.taskid &&
            tab.nodeid === item.nodeid
          );
        });
        this.tabList.forEach((tab: any) => {
          tab.active = false;
        });
        if (res) {
          res.active = true;
          return false;
        } else if (item.taskType === 'lock') {
          this.tabList.push({
            active: true,
            nodeid: item.nodeid,
            taskId: item.taskid,
            taskType: item.taskType,
            title: item.functionName,
            displayType: 'sourceCodeDisplay',
            headers: item.headers,
            functionDetails: item.functionDetails,
          });
        }

        this.autoShowActiveTab();
      } else if (msg.type === 'showTaskDetail') { // 根据工程id和任务id，展开对应的任务树，并展示任务详情
        this.Tree.setSelectedNode(msg.projectId, msg.taskId, msg.nodeId);
      }
    });

    // ViewPanel 操作监听动作
    this.panelSub = this.panelService.getObservable()
      .subscribe((action): void => {

        const { func, info } = action;

        switch (action.func) {
          case 'addPanel':
            if (info.viewType.indexOf('Tuninghelper') > -1 || info.viewType.indexOf('tuninghelper') > -1) {
              const curPanel = this.tabList.find((tab: any) =>
                (tab.tabpanelId != null && info.id != null && tab.tabpanelId === info.id) &&
                tab.displayType === info.viewType
              );
              this.tabList.forEach((tab: any) => { tab.active = false; });
              if (curPanel) { curPanel.active = true; return; }
              this.tabList.push({
                active: true,
                title: info.title,
                displayType: info.viewType,
                tabpanelId: info.id,
                ...info
              });
            } else {
              const panel = this.tabList.find((tab: any) =>
                (tab.id != null && info.id != null && tab.id === info.id)
                || (tab.displayType === info.viewType && tab.title === info.title)
              );
              this.tabList.forEach((tab: any) => { tab.active = false; });

              if (panel) { panel.active = true; return; }

              this.tabList.push({
                active: true,
                title: info.title,
                displayType: info.viewType,
                ...info
              });
            }
            this.autoShowActiveTab();
            break;
          case 'updatePanel':
            break;
          case 'deletePanel':
            break;
          default:
        }
      });
    this.certificates();

    // 来自调优助手的消息监听
    this.tuningHelperSub = this.tuningSysMessageService.getMessage({
      next: (message: TuningSysMessageDetail<any>) => {
        // 创建或者重启任务
        if (message.type === TuningSysMessageType.CreateSysTask) {
          this.tuningSysOperateTask(message.data);
        }

        // 查看任务报告
        if (message.type === TuningSysMessageType.ViewSysTask) {
          this.tuningSysViewTask(message.data);
        }

        // 查看关联报告（分析路径）
        if (message.type === TuningSysMessageType.ViewAssociatedReport) {
          this.tuningViewAssociatedReport(message.data);
        }
      }
    });
  }
  ngAfterViewInit(): void {
    // 解决拖动滚动条会导致tiny下拉框错位的问题
    this.indexContent.changes.subscribe((comps: any) => {
      if (comps.first) {
        if (!this.listenerFn) {
          this.listenerFn = this.renderer2.listen(
            comps.first.nativeElement,
            'scroll',
            () => {
              Util.trigger(document, 'tiScroll');
            }
          );
        }
      } else {
        if (this.listenerFn) {
          this.listenerFn();
          this.listenerFn = undefined;
        }
      }
    });

  }
  ngOnDestroy() {
    // 解决拖动滚动条会导致tiny下拉框错位的问题
    if (this.listenerFn) {
      this.listenerFn();
      this.listenerFn = undefined;
    }
    this.closeTabSub?.unsubscribe();

    this.subscription?.unsubscribe();
    this.openHelper?.unsubscribe();
    this.panelSub?.unsubscribe();
    this.openDataDetailPanal?.unsubscribe();
    this.tuningHelperSub?.unsubscribe();
  }
  // 切换工程管理和联动分析tab
  public changeTab(val: string) {
    if (val === this.tabActive) {
      return;
    } else {
      this.tabActive = val;
    }
  }
  public getTreeData(e: any) {
    this.treeData = e;
  }

  // 同步 project-manage 组件的【慢网速情况下，删除工程下发至收到删除结果的期间，会有获取工程详细接口下发，导致工程不存在的报错，加把锁控制】
  public setDeletingProject(status: any) {
    this.home2MainMsgService.emitDeletingProj(status);
  }

  public btnNewProject(item: any) {
    sessionStorage.setItem('projectId', item.projectId);
    this.Axios.axios.get(`${this.url.project}${encodeURIComponent(item.projectId)}/info/`).then((resp: any) => {
      if (this.toolType !== ToolType.DIAGNOSE) {
        this.scenes = judgeScene(resp.data.sceneId);
      }
      this.onOperateTask({
        type: 'create', // add start restart edit stop delete
        task: item,
        scenes: this.scenes,
      });
    });
  }

  /**
   * 新建调优助手任务
   * @param item 工程信息
   */
  public btnNewTuningHelperTask(item: any) {
    sessionStorage.setItem('projectId', item.projectId);
    this.onTuninghelperOperateTask({
      type: 'createTuninghelperTask',
      task: item,
      project: item,
      scenes: this.scenes,
    });
  }
  public toggleLeft() {
    this.leftState = !this.leftState;
    this.leftShowService.leftIfShow.next(this.leftState);
  }

  /**
   * 创建或重启任务
   * @param e 来自调优助手的消息
   */
  public tuningSysOperateTask(e: TuningSysCreateTaskData) {
    let title;
    if (e.type === 'create' || e.type === 'restart') {
      if (e.type === 'create') {
        title = this.i18n.common_term_task_new;
      }
      if (e.type === 'restart') {
        title = this.i18n.common_term_task_restart;
      }
      const tab = {
        title,
        actionType: e.type,
        active: true,
        displayType: e.task.isCreateDiagnoseTask ? 'tuningCreateDiagnoseTask' : 'addTask',
        projectName: e.task.projectName,
        taskDetail: e.task,
        refreshItem: e.task,
        tree: this.Tree,
        taskId: e.task.id,
        scenes: e.scenes,
      };
      sessionStorage.setItem('projectId', e.task.projectId.toString());
      this.tabList.forEach((tabItem: any) => {
        tabItem.active = false;
      });

      let tabIndex: number;
      this.tabList.find(
        (tabItem: any, index: number) => {
          if (tabItem.projectName === tab.projectName
            && tabItem.actionType === tab.actionType
            && tabItem.taskId === tab.taskId) {
            tabIndex = index;
          }
        }
      ); // 工程名 任务名 节点名 决定一个tab
      if (tabIndex) {
        this.tabList.splice(tabIndex, 1, tab);
      } else {
        this.tabList.push(tab);
      }
      if (e.type === 'create') {
        // user-guide
        const flogin = sessionStorage.getItem('userGuidStatus-sys-perf');
        if (flogin === '0') {
          setTimeout(() => {
            const time = Utils.dateFormat(new Date(), 'yyyyMMdd_hhmmss');
            sessionStorage.setItem('userGuideTask', 'Task_Demo_' + time);
            this.userGuide.userGuideStep.next('Task_Demo_' + time);
            this.userGuide.showMask('user-guide-taskname');
          }, 0);
        }
      }
      this.autoShowActiveTab();
    }
  }

  /**
   * 调优助手优化建议查看报告
   * @param tuningData 来自调优助手的消息
   */
  public tuningSysViewTask(tuningData: TuningSysViewTaskData) {
    // 菜单树种点击节点
    const tab = {
      title: `${tuningData.taskName}-${tuningData.nodeIP}-${tuningData.projectName}`, // 任务名+节点别名+projectName
      id: tuningData.taskId, // 任务的id
      nodeid: tuningData.nodeId, // 节点的id
      taskId: tuningData.taskId, // 任务的id
      taskType: tuningData.analysisType,
      status: 'Completed',
      active: true,
      displayType: 'dataDisplay',
      projectName: tuningData.projectName,
      nodeIP: tuningData.nodeIP, // 节点IP
      taskDetail: tuningData,   // 查看内存诊断分析报告用到
    };

    this.tabList.forEach((item: any) => {
      item.active = false;
    });
    this.checkTabListWithNewTab(tab); // 检查tablist中是否已经存在这个tab，如果已经存在就active，不存在则push进去
    this.autoShowActiveTab();
  }

  /**
   * 调优助手优化建议查看关联报告
   * @param data 来自调优助手的消息
   */
  public tuningViewAssociatedReport(tuningData: ViewAssociatedReportData) {
    const { projectName, taskDetail } = tuningData;
    const tab = {
      title: `${projectName}-${taskDetail.task.taskname}/${taskDetail.nodeNickName}`,
      actionType: 'associationNode',
      active: true,
      displayType: 'dataDisplay',
      projectName,
      taskDetail,
      taskType: 'tuninghelperRelation',
      tabPanelId: `associationNode-${taskDetail.task.parentNode.projectId}-${taskDetail.task.id}-${taskDetail.id}`,
      item: taskDetail,
    };
    this.tabList.forEach((tabItem: any) => {
      tabItem.active = false;
    });
    this.checkTuningHelperTabListWithNewTab(tab);
    this.autoShowActiveTab();
  }

  public onOperateTask(e: any) {
    let item;
    let projectName;
    let title;
    if (Object.prototype.hasOwnProperty.call(e.task, 'parentNode')) {
      item = e.task.parentNode;
      projectName = e.task.parentNode.projectName;
    } else {
      item = e.task;
      projectName = item.projectName;
    }
    if (e.type === 'create' || e.type === 'edit' || e.type === 'restart') {
      if (e.type === 'create') {
        title = this.i18n.common_term_task_new;
      }
      if (e.type === 'edit') {
        title = this.i18n.common_term_task_edit;
        this.tabCover.COUVER.call(this, e.task, item);
      }
      if (e.type === 'restart') {
        title = this.i18n.common_term_task_restart;
        this.tabCover.COUVER.call(this, e.task, item);
      }
      const tab = {
        title,
        actionType: e.type,
        active: true,
        displayType: 'addTask',
        projectName,
        taskDetail: e.task,
        refreshItem: item,
        tree: this.Tree,
        taskId: e.task.id,
        scenes: e.scenes,
      };
      this.tabList.forEach((tabItem: any) => {
        tabItem.active = false;
      });

      const current = this.tabList.find(
        (tabItem: any) =>
          tabItem.projectName === tab.projectName &&
          tabItem.actionType === tab.actionType &&
          tabItem.taskId === tab.taskId
      ); // 工程名 任务名 节点名 决定一个tab
      if (current && current.title) {
        current.active = true;
      } else {
        this.tabList.push(tab);
      }
      if (e.type === 'create') {
        // user-guide
        const flogin = sessionStorage.getItem('userGuidStatus-sys-perf');
        if (flogin === '0') {
          setTimeout(() => {
            const time = Utils.dateFormat(new Date(), 'yyyyMMdd_hhmmss');
            sessionStorage.setItem('userGuideTask', 'Task_Demo_' + time);
            this.userGuide.userGuideStep.next('Task_Demo_' + time);
            this.userGuide.showMask('user-guide-taskname');
          }, 0);
        }
      }
      this.autoShowActiveTab();
    } else if (e.type === 'scheduleEdit') {
      e.type = 'edit';
      title = this.i18n.common_term_task_edit;
      const tab: any = {
        title,
        actionType: e.type,
        active: true,
        displayType: 'addTask',
        projectName,
        taskDetail: e.task,
        refreshItem: item,
        tree: this.Tree,
        taskId: e.task.id,
      };
      tab.scheduleTaskId = e.task.scheduleTaskId;
      this.tabList.forEach((tabItem: any) => {
        tabItem.active = false;
      });

      const current = this.tabList.find((tabItem: any) => {
        return (
          tabItem.projectName === tab.projectName &&
          tabItem.actionType === tab.actionType &&
          tabItem.scheduleTaskId === tab.scheduleTaskId
        );
      }); // 工程名 任务名 节点名 决定一个tab
      if (current && current.title) {
        current.active = true;
      } else {
        this.tabList.push(tab);
      }
      this.autoShowActiveTab();
    } else if (e.type === 'delete') {
      this.deleteAnalysis(e.task, item);
    } else if (e.type === 'start') {
      this.startDataSamplingTask(e.task);
    } else if (e.type === 'stop') {
      this.stopAnalysis(e.task, item);
    } else if (e.type === 'deleteProject') {
      const taskIdArr = item.children.map((item2: any) => {
        return +item2.id;
      });
      this.tabCover.DELETEPROJECT.call(this, taskIdArr);
    }
    // e.task   为点击任务的详细信息
  }

  onLinkageOperate(
    action: { type: string, payload: any, [key: string]: any }
  ) {
    const { type, payload, task } = action;

    switch (type) {
      case 'addLinkage':
        {
          // 添加联动分析的判断
          const title = this.toolType === ToolType.TUNINGHELPER
            ? this.i18n.compareCreate.createCompare : this.i18n.common_term_report_new;
          const tab = {
            title,
            actionType: type,
            active: true,
            displayType: this.toolType === ToolType.TUNINGHELPER ? 'addCompare' : 'addLinkage',
            taskDetail: task,
          };
          this.tabList.forEach((tabItem: any) => {
            tabItem.active = false;
          });
          const current = this.tabList.find(
            (tabItem: any) =>
              tabItem.actionType === tab.actionType
          ); // 分析类型决定一个tab
          if (current && current.title) {
            current.active = true;
          } else {
            this.tabList.push(tab);
          }
          this.autoShowActiveTab();
        }
        break;
      case 'deleteTask':
        {
          const taskId = payload;
          this.tabList = (this.tabList as any[]).filter((tab) => taskId !== tab?.taskId);
          this.autoShowActiveTab();
        }
        break;
      default:
    }
  }

  public stopAnalysis(dataParama: any, parent: any): any {
    if (dataParama.type === 'system_config') {
      return false;
    }
    const params = {
      status: 'cancelled',
    };
    this.Axios.axios
      .put(this.url.toolTask + dataParama.id + '/status/', params)
      .then(() => {
        this.Tree.updateProjectDetail([parent]);
      })
      .catch((error: any) => { });
  }
  startDataSamplingTask(node: any) {
    const option: any = { status: 'running' };
    const runUserDataObj: LaunchRunUser = {};
    if (node['analysis-target'] === 'Launch Application') {
      node.nodeList.map((item: any) => {
        runUserDataObj[item.nodeIP] = {
          runUser: false,
          user_name: 'launcher',
          password: ''
        };
      });
      option.user_message = this.dealRunUserDataObj(runUserDataObj);
    } else if (node?.['analysis-type'] === 'miss_event') {
      const taskParam = JSON.parse(node?.task_param);
      if (taskParam?.target === 'app') {
        node.nodeList.map((item: any) => {
          runUserDataObj[item.nodeIP] = {
            runUser: false,
            user_name: 'launcher',
            password: ''
          };
        });
        option.user_message = this.dealRunUserDataObj(runUserDataObj);
      }
    }
    this.Axios.axios
      .get(
        '/res-status/?type=disk_space&project-name=' +
        encodeURIComponent(node.parentNode.projectName) +
        '&task-name=' +
        encodeURIComponent(node.taskname)
      )
      .then((data1: any) => {
        this.Axios.axios
          .put(this.url.toolTask + node.id + '/status/', option)
          .then(() => {
            // 关掉修改任务的 tab
            const editTabIndex = this.tabList.findIndex((tabItem: any) => {
              return tabItem.taskId === node.id;
            });
            if (editTabIndex > -1) {
              this.closeTab(editTabIndex);
            }
            const tab = {
              title: node.taskname + '-' + node.nodeList[0].nodeNickName, // 任务名+节点别名
              id: node.id, // 任务的id
              nodeid: node.nodeList[0].nodeId, // 节点的id
              taskId: node.id, // 任务的id
              taskType: node['analysis-type'],
              status: node.nodeList[0].sampleStatus,
              active: true,
              displayType: 'nodeProcessDisplay',
              projectName: node.parentNode.projectName,
            };
            this.tabList.forEach((item: any) => {
              item.active = false;
            });
            this.checkTabListWithNewTab(tab); // 检查tablist中是否已经存在这个tab，如果已经存在就active，不存在则push进去
            this.autoShowActiveTab();
          });
      });

  }
  private dealRunUserDataObj(obj: LaunchRunUser) {
    const runUserDataObj: RunUserDataObj = {};
    Object.keys(obj).map((key: string) => {
      if (obj[key].runUser) {
        runUserDataObj[key] = {
          user_name: obj[key].user_name,
          password: obj[key].password,
        };
      } else {
        runUserDataObj[key] = {
          user_name: 'launcher',
          password: '',
        };
      }
    });
    return runUserDataObj;
  }
  public deleteAnalysis(row: any, parent: any) {
    const self = this;
    this.tiMessage.open({
      type: 'warn',
      modalClass: 'delete-analysis',
      title: this.i18n.common_term_delete_title_analysis,
      content: this.i18n.common_term_delete_content_analysis,
      close() {
        self.deleteAnalysisClose(row, parent);
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
      },
    });
  }
  /**
   * 删除弹框确定按钮动作
   * @param row row
   * @param parent parent
   */
  private deleteAnalysisClose(row: any, parent: any) {
    const self = this;
    self.Axios.axios
      .delete(self.url.toolTask + row.id + '/')
      .then(async () => {
        self.tabList = self.tabList.filter((item: any) => {
          return item.taskId !== row.id;
        });
        let i = 0;
        self.tabList.forEach((tab: any) => {
          if (tab.active === false) {
            i++;
          }
        });
        if (i === self.tabList.length && self.tabList.length > 0) {
          self.tabList[0].active = true;
        }
        self.home2MainMsgService?.emitTabList(self.tabList);
        self.mytip.alertInfo({
          type: 'info',
          content: self.i18n.tip_msg.delete_ok,
          time: 3500,
        });
        await self.Tree.updateProjectDetail([parent]); // 任务操作成功之后需要调用
      })
      .catch((error: any) => { });
  }
  /**
   * 删除任务回调
   * @param context any
   */
  public closeModal(context: any) {
    this.deleteAnalysisClose(context.item, context.parent);
  }
  public async closeTabAndOpenDetail(e: any, index: number) {
    // 接收任务组件操作任务成功后的返回信息 并操作页签
    const currentTab = this.tabList[index];
    if (currentTab.actionType !== 'addLinkage' && this.Tree) {
      await this.Tree.updateProjectDetail([currentTab.refreshItem]);
    }
    if (Object.keys(e).length === 0) {
      this.closeTab(index);
    } else {
      const tab = {
        title: currentTab.actionType !== 'addLinkage' ? `${e.title}-${e.projectName}` : e.title, // 任务名+节点别名+工程名
        id: e.id, // 任务的id
        nodeid: e.nodeid, // 节点的id
        taskId: e.taskId, // 任务的id
        taskType: e.taskType,
        status: e.status,
        active: true,
        displayType: 'nodeProcessDisplay',
        projectName: e.projectName,
      };
      // 来自调优助手优化建议创建sys分析任务
      if (e.fromTuningTabId) {
        Object.assign(tab, { taskDetail: { fromTuningTabId: e.fromTuningTabId } });
      }
      // 来自调优助手优化建议创建诊断分析任务
      if (e.isCreateDiagnoseTask) {
        Object.assign(tab,
          {
            taskDetail: {
              fromTuningTabId: e.fromTuningTabId,
              isCreateDiagnoseTask: e.isCreateDiagnoseTask
            }
          }
        );
      }
      this.tabList = this.tabList.filter((items: any) => {
        return items.taskId !== e.id;
      });
      this.tabList.splice(index, 1, tab);
      // 在不是联动分析任务时更新树，以免报错
      if (tab.taskType !== 'task_contrast' && this.Tree) {
        this.Tree.tree.forEach((project: any) => {
          if (project.projectName === tab.projectName) {
            project.expanded = true;
            project.children.forEach((task: any) => {
              if (task.id === tab.taskId) {
                const currentTask = task;
                this.Tree.clearHilight(); // 清除之前的hilight
                currentTask.expanded = true;
                currentTask.children[0].hilight = true;
              }
            });
          }
        });
      }
      this.home2MainMsgService.emitTabList(this.tabList);
      this.leftShowService.leftIfShow.next(this.leftState);  // 切换的时候派发事件  时间轴自适应
    }
  }

  /**
   * 切换tab页签
   */
  public onActiveChange() {
    this.home2MainMsgService.getCurrActiveTab();
  }

  public closeTab(index: any, title?: string) {
    this.tabList.splice(index, 1);
    const active = this.tabList.find((item: any) => item.active === true);
    if (!active) {
      if (index - 1 >= 0 && this.tabList.length > 0) {
        this.tabList[index - 1].active = true;
      } else if (index === 0 && this.tabList.length > 0) {
        this.tabList[0].active = true;
      }
    }
    const scroll = $('.scroll-box').width();
    const box = $('.tab-header').width();
    if (scroll > box) {
      this.showTabArrow = true;
    } else {
      this.showTabArrow = false;
    }
    this.leftShowService.leftIfShow.next(this.leftState);  // 切换的时候派发事件  时间轴自适应
    this.autoShowActiveTab();

    // 在点击叉叉按钮之后，如果在tab被移除的前一刻鼠标移到tiOverflow的元素上去
    // tiOverflow的tip将不会消失。这里对于这个tip做一下消失的处理
    setTimeout(() => {
      const dom = document.querySelector('ti-tip-container');
      if (dom && title) {
        if (dom.innerHTML.includes(title)) {
          dom.remove();
        }
      }
    }, 0);
  }
  public switchActive(index: any) {
    this.tabList.forEach((item: any) => {
      item.active = false;
    });
    this.tabList[index].active = true;
    this.leftShowService.leftIfShow.next(this.leftState);
  }
  public onSelectNode(e: any) {
    // 菜单树种点击节点
    const tab = {
      title: `${e.parent[1].taskname}-${e.nodeNickName}-${e.parent[0].projectName}`, // 任务名+节点别名+projectName
      id: e.taskId, // 任务的id
      nodeid: e.nodeId, // 节点的id
      taskId: e.taskId, // 任务的id
      taskType: e.parent[1]['analysis-type'],
      status: e.sampleStatus,
      active: true,
      displayType: 'dataDisplay',
      projectName: e.parent[0].projectName,
      nodeIP: e.nodeIP // 节点IP
    };
    if (
      e.sampleStatus === 'Sampling' ||
      e.sampleStatus === 'Analyzing' ||
      e.sampleStatus === 'Stopping' ||
      e.sampleStatus === 'Cancelling' ||
      e.sampleStatus === 'Created' ||
      e.sampleStatus === 'Waiting'
    ) {
      tab.displayType = 'nodeProcessDisplay';
    } else {
      tab.displayType = 'dataDisplay';
    }
    // 需要判断任务状态,如果不能查看任务详情，这打开任务进度tab

    sessionStorage.setItem('ecp_analysisType', e.parent[1]['analysis-target']);
    this.tabList.forEach((item: any) => {
      item.active = false;
    });
    this.checkTabListWithNewTab(tab); // 检查tablist中是否已经存在这个tab，如果已经存在就active，不存在则push进去
    this.autoShowActiveTab();
  }

  /**
   * 调优助手-关闭页签打开一个新页签
   */
  public async tuningHelperCloseTabAndOpenDetail(e: any, index: number) {
    const currentTab = this.tabList[index];
    if (this.tuninghelper && currentTab.item?.projectName) {
      await this.tuninghelper.updateProjectDetail([currentTab.item]);
    }
    // 接收任务组件操作任务成功后的返回信息 并操作页签
    if (Object.keys(e).length === 0) {
      this.closeTab(index);
    } else {
      let title = '';
      let tabPanelId = '';
      if (e.taskType === 'optimization') {
        title = `${e.title}-${e.projectName}`; // 任务名+节点别名+工程名
        tabPanelId = `tuninghelperDetail-${e.title}-${e.projectName}`;
      } else if (e.taskType === 'tuninghelperInfoLog') {
        title = `${this.i18n.common_term_task_detail}-${e.title}`;
        tabPanelId = `tuninghelperInfoLog-${e.title}`;
      }
      let currentTask: any;
      if (this.tuninghelper) {
        this.tuninghelper.tree.forEach((project: any) => {
          if (project.projectName === e.projectName) {
            project.expanded = true;
            project.children.forEach((task: any) => {
              if (task.id === e.taskId) {
                currentTask = task;
                this.tuninghelper.clearHilight(); // 清除之前的hilight
                currentTask.expanded = true;
                currentTask.children[0].hilight = true;
              }
            });
          }
        });
      }
      const tab = {
        title,
        tabPanelId,
        id: e.id, // 任务的id
        nodeid: e.nodeid, // 节点的id
        taskId: e.taskId, // 任务的id
        taskType: e.taskType,
        status: e.status,
        active: true,
        displayType: 'nodeProcessDisplay',
        projectName: e.projectName,
        ownerId: e.ownerId,
        taskDetail: e.taskDetail || currentTask?.children?.[0],  // taskDetail为undefined 取当前创建的任务
      };
      this.tabList.splice(index, 1, tab);
      this.home2MainMsgService.emitTabList(this.tabList);
      this.leftShowService.leftIfShow.next(this.leftState);  // 切换的时候派发事件  时间轴自适应
    }
  }

  /**
   * 调优助手-选择节点回调
   */
  public openTuninghelper(e: any) {
    const nodeProcessStatus = ['Sampling', 'Analyzing', 'Stopping', 'Cancelling', 'Created', 'Waiting'];
    const tab = {
      title: `${e.parent[1].taskname}-${e.nodeNickName}-${e.parent[0].projectName}`,
      tabPanelId: `tuninghelperDetail-${e.parent[1].taskname}-${e.nodeNickName}-${e.parent[0].projectName}`,
      id: e.taskId, // 任务的id
      nodeid: e.nodeId, // 节点的id
      taskId: e.taskId, // 任务的id
      taskType: e.parent[1]['analysis-type'],
      status: e.sampleStatus,
      projectName: e.parent[0].projectName,
      active: true,
      displayType: nodeProcessStatus.includes(e.sampleStatus) ? 'nodeProcessDisplay' : 'dataDisplay',
      nodeIP: e.nodeIP, // 节点IP
      ownerId: e.ownerId,  // 用户id
      taskDetail: e,  // 任务详情
    };
    this.tabList.forEach((item: any) => {
      item.active = false;
    });
    this.checkTuningHelperTabListWithNewTab(tab); // 检查tablist中是否已经存在这个tab，如果已经存在就active，不存在则push进去
    this.autoShowActiveTab();
  }

  /**
   * 调优助手-打开查看详细数据
   * @param e 页签参数
   */
  public openDataDetailHepler(e: any) {
    const tab = {
      title: `${this.i18n.tuninghelper.taskDetail[e.type]}`,
      tabPanelId: `${e.type}-${e.taskId}-${e.nodeId}`,
      active: true,
      taskType: e.taskType,
      displayType: 'dataDisplay',
      ownerId: e.ownerId,  // 用户id
      taskDetail: {
        showDetailType: e.type,
        nodeid: e.nodeId, // 节点的id
        taskId: e.taskId, // 任务的id
      }
    };
    this.tabList.forEach((item: any) => {
      item.active = false;
    });
    this.checkTuningHelperTabListWithNewTab(tab); // 检查tablist中是否已经存在这个tab，如果已经存在就active，不存在则push进去
    this.autoShowActiveTab();
  }
  /**
   * 调优助手-树结构任务操作
   */
  public onTuninghelperOperateTask(e: any) {
    let item: any;
    let projectName;
    let title;
    let displayType = e.type;
    let taskType = '';
    let tabPanelId = '';
    projectName = e.project?.projectName;
    if (Object.prototype.hasOwnProperty.call(e.task, 'parentNode')) {
      item = e.task.parentNode;
    } else {
      item = e.task;
    }
    item.projectName = projectName;
    if (e.type === 'reanalyzeTask') {
      displayType = 'createTuninghelperTask';
      title = this.i18n.tipMsg.reanalyzeM + e.task.taskname;
      tabPanelId = `reanalyzeTask-${e.project?.projectId}-${e.task.id}`;
    } else if (e.type === 'reanalyzeServer') {
      displayType = 'createTuninghelperTask';
      title = this.i18n.tipMsg.reanalyzeM + e.task.nodeNickName;
      tabPanelId = `reanalyzeServer-${e.project?.projectId}-${e.task.task.id}-${e.task.id}`;
    } else if (e.type === 'createTuninghelperProject') {
      title = this.i18n.project.newPro;
      tabPanelId = 'createTuninghelperProject';
    } else if (e.type === 'createTuninghelperTask') {
      title = this.i18n.common_term_task_new;
      tabPanelId = `createTuninghelperTask-${e.project?.projectId}`;
    } else if (e.type === 'associationNode') {
      displayType = 'dataDisplay';
      taskType = 'tuninghelperRelation';
      title = this.i18n.tipMsg.associationNodeM;
      if (e.task.level === 'task') {
        title = `${projectName}-${e.task.taskname}`;
        tabPanelId = `associationNode-${e.project?.projectId}-${e.task.id}`;
      } else if (e.task.level === 'node') {
        title = `${projectName}-${e.task.task.taskname}/${e.task.nodeNickName}`;
        tabPanelId = `associationNode-${e.project?.projectId}-${e.task.task.id}-${e.task.id}`;
      }
    } else if (e.type === 'viewInfoLog') {
      displayType = 'dataDisplay';
      taskType = 'tuninghelperInfoLog';
      title = `${this.i18n.common_term_task_detail}-${e.task.task.taskname}-${e.task.nodeNickName}-${projectName}`;
      tabPanelId = `tuninghelperInfoLog-${e.task.task.taskname}-${e.task.nodeNickName}-${projectName}`;
    } else if (e.type === 'deleteTask') {
      this.deleteModal.deleteBefore(e.task.id, true).then((list: any[]) => {
        if (list.length > 0) {
          this.deleteModal.deleteModel(true, list, e.task.taskname, e.task, e.project);
        } else {
          this.deleteAnalysis(e.task, item);
        }
      });
      return;
    } else if (e.type === 'deleteProject') {
      const taskIdArr = item.children.map((item2: any) => {
        return +item2.id;
      });
      this.tabCover.DELETEPROJECT.call(this, taskIdArr);
      return;
    } else if (e.type === 'stopTask') {
      this.tuningHelperStopAnalysis(e.task, item);
      return;
    }
    const tab = {
      title,
      actionType: e.type,
      active: true,
      displayType,
      projectName,
      taskDetail: e.task,
      taskType,
      tabPanelId,
      item,
    };
    this.tabList.forEach((tabItem: any) => {
      tabItem.active = false;
    });
    this.checkTuningHelperTabListWithNewTab(tab);
    this.autoShowActiveTab();

  }

  /**
   *  检查调优助手tablist中是否已经存在这个页面，如果已经存在就直接切换显示，不存在则添加进去
   */
  public checkTuningHelperTabListWithNewTab(tab: any) {
    const current = this.tabList.find(
      (item: any) =>
        item.tabPanelId === tab.tabPanelId &&
        (item.displayType === tab.displayType ||
          item.displayType === 'nodeProcessDisplay' ||
          item.displayType === 'dataDisplay')
    ); // 工程名 任务名 节点名 决定一个tab
    if (current && current.title) {
      current.active = true;
    } else {
      this.tabList.push(tab);
    }
  }

  /**
   * 调优助手停止分析
   * @param data 当前任务信息
   * @param parent 当前任务所属工程信息
   */
  public tuningHelperStopAnalysis(dataParam: any, parent: any): any {
    const params = {
      status: 'cancelled',
    };
    this.Axios.axios
      .put(this.url.toolTask + dataParam.id + '/status/', params)
      .then(() => {
        this.tuninghelper.updateProjectDetail([parent]);
      })
      .catch((error: any) => { });
  }

  public showTuninghelperCompare(e: any) {
    const tab = {
      title: e.taskName, // 任务名
      id: e.id, // 任务的id
      nodeid: 1, // 节点的id
      taskId: e.id, // 任务的id
      taskType: 'tuninghelperCompare',
      status: 'Completed',
      active: true,
      displayType: 'dataDisplay',
      projectName: '',
      nodeIP: e.nodeList ? e.nodeList[0].nodeIP : '' // 节点IP
    };
    if (
      e.sampleStatus === 'comparing' ||
      e.sampleStatus === 'failed' ||
      e.sampleStatus === 'Stopping' ||
      e.sampleStatus === 'Cancelling' ||
      e.sampleStatus === 'Created' ||
      e.sampleStatus === 'Waiting' ||
      e.sampleStatus === 'Running'
    ) {
      tab.displayType = 'nodeProcessDisplay';
    } else {
      tab.displayType = 'dataDisplay';
    }
    this.tabList.forEach((item: any) => {
      item.active = false;
    });
    this.checkTabListWithNewTab(tab); // 检查tablist中是否已经存在这个tab，如果已经存在就active，不存在则push进去
    this.autoShowActiveTab();
  }

  // 打开联动分析任务
  public openLinkage(e: any) {
    const tab = {
      title: `${e.taskname}`, // 任务名
      id: e.id, // 任务的id
      nodeid: e.nodeList[0].nodeId, // 节点的id
      taskId: e.id, // 任务的id
      taskType: e['analysis-type'],
      status: e['task-status'],
      active: true,
      displayType: 'dataDisplay',
      projectName: '',
      nodeIP: e.nodeList[0].nodeIP // 节点IP
    };
    if (
      e.sampleStatus === 'Sampling' ||
      e.sampleStatus === 'Analyzing' ||
      e.sampleStatus === 'Stopping' ||
      e.sampleStatus === 'Cancelling' ||
      e.sampleStatus === 'Created' ||
      e.sampleStatus === 'Waiting' ||
      e.sampleStatus === 'Running'
    ) {
      tab.displayType = 'nodeProcessDisplay';
    } else {
      tab.displayType = 'dataDisplay';
    }
    this.tabList.forEach((item: any) => {
      item.active = false;
    });
    this.checkTabListWithNewTab(tab); // 检查tablist中是否已经存在这个tab，如果已经存在就active，不存在则push进去
    this.autoShowActiveTab();
  }

  /**
   * 检查tablist中是否已经存在这个tab，如果已经存在就active，不存在则push进去
   * @param tab 当前tab数据源
   */
  public checkTabListWithNewTab(tab: any) {
    const current = this.tabList.find(
      (item: any) =>
        item.title === tab.title &&
        (item.displayType === tab.displayType ||
          item.displayType === 'nodeProcessDisplay' ||
          item.displayType === 'dataDisplay')
    ); // 工程名 任务名 节点名 决定一个tab
    if (current && current.title) {
      current.active = true;
    } else {
      this.tabList.push(tab);
    }
  }

  public autoShowActiveTab() {
    this.home2MainMsgService?.emitTabList(this.tabList);
  }
  ngAfterContentChecked(): void {
  }
  public setTranslate() {
    const a = -this.tanslateX;
    return `translateX(${a}px)`;
  }
  public clickTranslate(dre: any) {
    const step = 220 * 2;
    const scroll = $('.scroll-box').width();
    const box = $('.tab-header').width();
    if (scroll > box) {
      if (dre === 'left') {
        const target = this.tanslateX - step;
        if (target > 0) {
          this.tanslateX = target;
        } else {
          this.tanslateX = 0;
        }
      } else if (dre === 'right') {
        const target = this.tanslateX + step;
        if (target < scroll - 200) {
          this.tanslateX = target;
        }
      }
    }
  }

  // 验证证书是否有快到期或已经到期的
  public certificates(): void {
    this.Axios.axios.get(this.url.certificates).then((res: any) => {
      const flag = res.data.some((res2: any) => {
        return +res2.certStatus >= 1;
      });
      if (
        flag &&
        (sessionStorage.getItem('isAlert') === 'false' ||
          !sessionStorage.getItem('isAlert'))
      ) {
        sessionStorage.setItem('isAlert', 'true');
        this.tiMessage.open({
          type: 'warn',
          title: this.i18n.certificate.notice,
          content: this.i18n.certificate.warnNotice,
          okButton: {
            text: this.i18n.common_term_operate_ok,
          },
          cancelButton: {
            show: false,
          },
        });
      }
    });
  }
}
