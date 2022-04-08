import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { OpenNodeInfo } from './domain';
import * as Util from 'projects/sys/src-web/app/util';

import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  EventEmitter,
  Output,
  OnDestroy,
  AfterViewInit,
  AfterViewChecked,
} from '@angular/core';
import {
  TiTreeComponent,
  TiTreeNode,
  TiTreeUtil,
  TiTipRef,
} from '@cloud/tiny3';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { ScheduleTaskService } from 'projects/sys/src-web/app/service/schedule-task.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { UserGuideService } from 'projects/sys/src-web/app/service/user-guide.service';
import { OpenNodeService } from './services/open-node.service';
import { AnalysisScene } from 'projects/sys/src-web/app/domain';
import { Subscription } from 'rxjs';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-project-manage',
  templateUrl: './project-manage.component.html',
  styleUrls: ['./project-manage.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectManageComponent implements OnInit, OnDestroy, AfterViewChecked {
  private url: any;
  constructor(
    public timessage: MessageModalService,
    public mytip: MytipService,
    public i18nService: I18nService,
    private urlService: UrlService,
    public Axios: AxiosService,
    public leftShowService: LeftShowService,
    public projectId: ScheduleTaskService,
    public userGuide: UserGuideService,
    private openNodeService: OpenNodeService,
  ) {
    this.url = this.urlService.Url();
    this.i18n = this.i18nService.I18n();
    this.tipMsg = {
      refreshP: this.i18n.tipMsg.refreshP, // 刷新工程
      createP: this.i18n.tipMsg.createP, // 创建工程
      modifyP: this.i18n.tipMsg.modifyP, // 修改工程
      deleteP: this.i18n.tipMsg.deleteP, // 删除工程
      createM: this.i18n.tipMsg.createM, // 创建任务
      modifyM: this.i18n.tipMsg.modifyM, // 修改任务
      deleteM: this.i18n.tipMsg.deleteM, // 删除任务
      startM: this.i18n.tipMsg.startM, // 启动任务
      stopM: this.i18n.tipMsg.stopM, // 停止任务
      restartM: this.i18n.tipMsg.restartM, // 重启任务，
    };

    this.openNodeSub = this.openNodeService.openNodeLister$.subscribe((nodeInfo: OpenNodeInfo) => {
      const proId: number = +sessionStorage.getItem('projectId');
      // 去除高亮
      this.clearHilight();
      // 关闭所有节点
      this.openNodeService.setAllNodeCheckout(this.tree);
      // 开启特定的节点
      this.openNodeService.setTheNodeChecked(
        this.tree, { projectId: proId, taskId: nodeInfo.taskId, nodeIp: nodeInfo.nodeIp }
      );
      // 选出被开启的节点
      this.selectedData = TiTreeUtil.getSelectedData(this.tree, false, false);
      // 设置高亮
      this.selectedData[0].hilight = true;
      // 通知处理
      this.selectNode.emit(this.selectedData[0]);
      this.leftShowService.leftIfShow.next();
    });
  }
  @ViewChild('TREE') TREE: any;
  @ViewChild('addProjectTemp') addProjectTemp: any;
  @ViewChild('nodeListTemp') nodeListTemp: any;
  // 导入任务
  @ViewChild('importTaskModel') importTaskModel: any;
  // 导出任务
  @ViewChild('exportTaskModel') exportTaskModel: any;

  @Output() operateTask = new EventEmitter();
  @Output() setDeletingProject = new EventEmitter();
  @Output() selectNode = new EventEmitter();
  @Output() sendTreeData = new EventEmitter();
  public i18n: any;
  public wizarding = false;
  public userInfo = {
    role: '',
    id: '',
  };
  public updateProjectStateInterval: any;
  public updateProjectDetailInterval: any;
  // 慢网速情况下，删除工程下发至收到删除结果的期间，会有获取工程详细接口下发，导致工程不存在的报错，加把锁控制
  public deletingProject = false;
  private tipInstance: TiTipRef; // tip组件实例
  private tipShowState = false; // tip显示状态标志位
  public tipMsg: any;
  public tree: Array<TiTreeNode> = [];
  treeID = 5;
  public scenes: AnalysisScene;
  public userGuideStep: Subscription;
  public openNodeSub: Subscription;
  public userGuideProject = ''; // 当前新手引导创建的工程
  // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
  selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
    this.tree,
    false,
    false
  );
  public timeoutId: any;
  public taskTip = {
    taskName: '',
    analysisObject: '',
    analysisType: '',
  };
  public taskTipDiagnose = {
    taskName: '',
    diagnoseObject: '',
    diagnoseContent: '',
    isFunction: false,
  };
  /** 是否内存诊断 */
  public isDiagnose = false;
  ngOnDestroy() {
    clearInterval(this.updateProjectStateInterval);
    clearInterval(this.updateProjectDetailInterval);
    this.userGuideStep?.unsubscribe();
    this.openNodeSub?.unsubscribe();
  }
  ngOnInit() {
    this.isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
    this.userInfo.id = sessionStorage.getItem('loginId');
    this.userInfo.role = sessionStorage.getItem('role');
    this.getProjectList('off');
    this.updateProjectStateInterval = setInterval(() => {
      this.updateProjectState();
    }, 10000);
    this.autoupdateProjectDetail();

    this.userGuideStep = this.userGuide.userGuideStep.subscribe((str) => {
      this.userGuideProject = sessionStorage.getItem('userGuideProject');
      if (str === 'user-guide-add-task') {
        this.updateProjectState().then(() => {
          const item = this.tree.find(val => {
            return val.projectName === this.userGuideProject;
          });
          if (item) {
            this.taskAction('create', item);
          } else {
            this.wizarding = true;
            this.userGuide.closeUserGuide();
          }
        });
      } else if (str === 'wizarding') {
        this.wizarding = true;
      }
    });
  }

  ngAfterViewChecked(): void {
    this.treeMouseenter();
  }

  public treeMouseenter() {
    $('.ti3-tree-content-box').on('mouseenter', function() {
      if ($(this).find('.mytree-checked').length === 1) {
        $(this).css({ 'background-color': 'transparent' });
      }
    });
  }

  public refreshProject() {
    this.getProjectList('off');
  }
  public getProjectList(auto = 'off') {
    const params = {
      'auto-flag': auto,
      date: Date.now(),
    };
    this.Axios.axios.get(this.url.project, { params }).then((data: any) => {
      const temp: any = [];
      data.data.projects.sort(
        (a: any, b: any) => (this.getDate(b.timeCreated).getTime() - this.getDate(a.timeCreated).getTime()));
      data.data.projects.forEach((item: any) => {
        temp.push({
          level: 'project',
          label: item.projectName,
          numFunction: item.numFunction,
          numProcess: item.numProcess,
          numSystem: item.numSystem,
          ownerId: item.ownerId,
          ownerName: item.ownerName,
          projectId: item.projectId,
          projectName: item.projectName,
          status: item.status,
          timeCreated: item.timeCreated,
          children: [],
          expanded: false,
          isImport: item.is_import,
          currentGuide: item.projectName === this.userGuideProject ? true : false,
        });
      });
      this.sendTreeData.emit(temp);
      this.tree = temp;
    });
  }
  // 异步请求数据后插入当前节点并展开
  beforeExpand(TreeCom: TiTreeComponent): void {
    // 1.获取当前点击节点
    const item: TiTreeNode = TreeCom.getBeforeExpandNode();
    if (item.level === 'project') {
      sessionStorage.setItem('projectId', item.projectId);
      this.getProjectDetail(item);
    } else if (item.level === 'task') {
      this.collapseLevelNode(this.tree, ['task']);
      item.children = item.children;
      item.expanded = true;
    }
  }

  public getAnalysisTarget(taskInfo: any) {
    const missAnalysisTarget: any = {
      sys: 'Profile System',
      app: 'Launch Application',
      pid: 'Attach to Process'
    };
    if (taskInfo['analysis-type'] === 'miss_event') {
      return missAnalysisTarget[JSON.parse(taskInfo.task_param).target];
    } else {
      return taskInfo['analysis-target'] || taskInfo.analysisTarget;
    }
  }

  public getTipInfo(e: any, item: any): void {
    const analysisTypesDir: any = {
      system: this.i18n.sys_summary.cpupackage_tabel.sysPro,
      system_config: this.i18n.mission_create.sysConfig,
      resource_schedule: this.i18n.mission_create.resSchedule,
      microarchitecture: this.i18n.mission_create.structure,
      'process-thread-analysis': this.i18n.mission_create.process,
      mem_access: this.i18n.mission_modal.memAccessAnalysis,
      miss_event: this.i18n.mission_modal.memAccessAnalysis,
      falsesharing: this.i18n.mission_modal.memAccessAnalysis,
      'C/C++ Program': this.i18n.mission_create.cPlusPlus,
      system_lock: this.i18n.mission_create.lock,
      ioperformance: this.i18n.mission_create.io,
      hpc_analysis: this.i18n.mission_create.hpc_analysis,
      netio_diagnostic: this.i18n.diagnostic.taskParams.networkIO,
      memory_diagnostic: this.i18n.diagnostic.taskParams.ram,
      storageio_diagnostic: this.i18n.diagnostic.taskParams.storageIO,
    };
    if (this.isDiagnose) {
      this.taskTipDiagnose.taskName = item.taskname || item['task-name'] || item.taskName;
      this.taskTipDiagnose.diagnoseObject = analysisTypesDir[(item['analysis-type'] || item.analysisType)];
      this.taskTipDiagnose.diagnoseContent = this.getdiagnoseContent(item);
      this.taskTipDiagnose.isFunction = item['analysis-type'] !== 'memory_diagnostic';
    }
    this.taskTip.taskName = item.taskname || item['task-name'];
    this.taskTip.analysisType = analysisTypesDir[(item['analysis-type'] || item.analysisType)];
    const analysisObject = this.getAnalysisTarget(item);
    if (!analysisObject || analysisObject === 'Profile System') {
      this.taskTip.analysisObject = this.i18n.common_term_projiect_task_system;
    } else {
      this.taskTip.analysisObject = this.i18n.common_term_task_crate_path;
    }
    const spanDom: any = e.target;
    spanDom.style.color = '#267DFF';
  }

  public textColor(e: any): void {
    const spanDom: any = e.target;
    spanDom.style.color = '#616161';
  }

  public getProjectDetail(item: any) {
    return new Promise((resolve, reject) => {
      const getDataPromise: any = this.getNodeData(item);
      getDataPromise.then((data: any) => {
        // 2.将请求到的数据挂到该节点上
        const list = data.data[0].tasklist.sort(
          (a: any, b: any) => (this.getDate(b.createtime).getTime() - this.getDate(a.createtime).getTime())
        );
        list.map((node: any) => {
          node.parent = item.label;
          node.ownerId = data.data[0].ownerid;
          node.label = node.taskname;
          node.parentNode = item;
          node.status = node['task-status'];
          node.nodeList.map((node2: any) => {
            node2.label = node2.nodeNickName;
            node2.expanded = false;
            node2.level = 'node';
            node2.taskId = node.id;
            node2.isImport = item.isImport;
          });
          node.children = node.nodeList;
          node.isImport = item.isImport;
          node.expanded = false;
          node.level = 'task';
        });
        item.children = list;

        // 3.将该节点展开
        item.expanded = true;

        resolve(item);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }

  getNodeData(item: any): any {
    if (!this.deletingProject) {
      return this.Axios.axios.get(
        this.url.task + '?analysis-type=all&project-name=' +
        encodeURIComponent(item.projectName) +
        '&auto-flag=off' +
        '&page=1' +
        '&per-page=1000'
      );
    }
  }

  /**
   * 手动设置tree的选中节点
   * @param projectId 工程id
   * @param taskId 任务id
   * @param nodeId 节点id，默认第一个节点
   */
  public setSelectedNode(projectId: any, taskId: any, nodeId?: any) {
    try {
      this.clearHilight();
      // 更新一次工程列表，防止工程列表的is_import还是false，导致展开的节点带有已删除标志
      this.updateProjectState().then(async () => {
        const projectItem = this.tree.find(item => item.projectId === projectId);
        if (!projectItem.children || !projectItem.children.length) {  // 工程未获取过任务列表
          sessionStorage.setItem('projectId', projectItem.projectId);
          await this.getProjectDetail(projectItem);
        }
        projectItem.expanded = true;
        const taskItem = projectItem.children.find(item => item.id === taskId);
        taskItem.expanded = true;
        const temp: any = [];
        this.tree.forEach((item) => {
          if (item.expanded) {
            temp.push(item);
          }
        });
        this.updateProjectDetail(temp, false);
        const nodeItem = (nodeId === undefined)
          ? taskItem.children[0] : taskItem.children.find(item => item.nodeId === nodeId);
        nodeItem.hilight = true;
        nodeItem.parent = [projectItem, taskItem];
        this.onSelect(nodeItem, true);
      });
    } catch (error) { }
  }

  public clearHilight(): void {
    this.tree.forEach((project) => {
      if (project.expanded) {
        project.children.forEach((task) => {
          task.children.forEach((node) => {
            node.hilight = false;
          });
        });
      }
    });
  }
  onSelect(event: TiTreeNode, manuals?: any): void {
    this.clearHilight();

    // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
    this.selectedData = TiTreeUtil.getSelectedData(this.tree, false, false);

    if (event.level === 'project') {
      sessionStorage.setItem('projectId', event.projectId);
      this.projectId.handleProjectId(event.projectId);
    }
    if (event.level === 'task') {
      sessionStorage.setItem('projectId', event.parentNode.projectId);
    }
    if (event.level === 'node') {
      event.hilight = true;
      this.selectNode.emit(manuals ? event : this.selectedData[0]);
      sessionStorage.setItem('projectId', event.parent[0].projectId);
    }
    this.leftShowService.leftIfShow.next();
  }

  public updateProjectState() {
    return new Promise((resolve, reject) => {
      const params = {
        'auto-flag': 'on',
        date: Date.now(),
      };

      this.Axios.axios.get(this.url.project, { params }).then((data: any) => {
        data.data.projects.sort(
          (a: any, b: any) => (this.getDate(b.timeCreated).getTime() - this.getDate(a.timeCreated).getTime()));
        this.tree = data.data.projects.map((project: any) => {
          const myProject = this.tree.find(item => item.projectId === project.projectId);

          return {
            level: 'project',
            label: project.projectName,
            numFunction: project.numFunction,
            numProcess: project.numProcess,
            numSystem: project.numSystem,
            ownerId: project.ownerId,
            ownerName: project.ownerName,
            projectId: project.projectId,
            projectName: project.projectName,
            status: project.status,
            timeCreated: project.timeCreated,
            children: myProject ? myProject.children : [],
            expanded: myProject ? myProject.expanded : false,
            isImport: project.is_import,
            currentGuide: project.projectName === this.userGuideProject ? true : false,
          };
        });

        resolve(data);
      });
    });
  }

  public async deleteProject(item: any) {
    const scheduleTaskList = await this.getPreTableList(item.projectId).catch(
      (error) => {
      }
    );
    const preTableNum = scheduleTaskList.filter((item2: any) =>
      ['reserve', 'running'].includes(item2.scheduleStatus)
    ).length;

    let content = this.i18n.common_term_delete_content;
    if (preTableNum) {
      content = this.i18n.common_term_delete_content_contains_scheduled_tasks;
    }

    const self = this;
    this.timessage.open({
      type: 'warn',
      modalClass: 'project-del',
      title: this.i18n.common_term_delete_title,
      content,
      okButton: {
        primary: false,
        autofocus: false,
      },
      cancelButton: {
        primary: true,
        autofocus: true,
      },
      close() {
        self.doDeleteProjrcts(item.projectId, item);
      },
    });
  }
  public async getPreTableList(id: any) {
    let url = '/schedule-tasks/?project-id=' + id;
    if (this.isDiagnose) {
      url += '&analysis-type=memory_diagnostic';
    }
    const res = await this.Axios.axios.get(url);
    return res.data.scheduleTaskList;
  }
  public doDeleteProjrcts(id: any, items: any) {
    this.deletingProject = true;
    this.setDeletingProject.emit(true);

    this.Axios.axios.delete(this.url.project + id + '/').then((data: any) => {
      this.projectId.handleProjectId(-1);
      sessionStorage.removeItem('projectId');
      this.mytip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.delete_ok,
        time: 3500,
      });
      this.tree.forEach((item, index) => {
        if (item.projectId === id) {
          const DATA: Array<TiTreeNode> = this.tree;
          TiTreeUtil.removeNode(DATA, DATA[index]);
          this.tree = DATA;
          this.operateTask.emit({
            type: 'deleteProject', // add start restart edit stop delete
            task: items,
          });
        }
      });

      this.deletingProject = false;
      this.setDeletingProject.emit(false);
    }).catch((e: any) => {
      this.deletingProject = false;
      this.setDeletingProject.emit(false);
    });
  }

  // 添加工程
  public addProject() {
    this.addProjectTemp.showModalToCreateProject();
  }

  public addProjectOK(e: any) {
    this.updateProjectState().then(() => {
      // user-guide
      const flogin = sessionStorage.getItem('userGuidStatus-sys-perf');
      if (flogin === '0') {
        setTimeout(() => {
          this.userGuide.hideMask();
          this.userGuide.showMask('user-guide-toggle');
        }, 0);
      }
    });
  }

  // 修改工程
  public editProject(item: any) {
    this.Axios.axios.get(`${this.url.project}${encodeURIComponent(item.projectId)}/info/`).then((res: any) => {
      const data = res.data;

      this.addProjectTemp.showModalToEditProject({
        projectName: data.projectName,
        projectId: item.projectId,
        sceneId: data.sceneId,
        selectedNodeList: data.nodeList.map((item1: any) => item1.id),
      });
    }).catch((e: any) => { });
  }

  public editProjectOK(e: any) {
    this.tree.forEach((item) => {
      if (item.projectId === e.projectId) {
        item.projectName = e.projectName;
        item.label = e.projectName;
      }
    });
  }

  // 查看工程
  public showProjectNodeInfo(item: any) {
    if (item.isImport) { return; }
    this.Axios.axios.get(`${this.url.project}${encodeURIComponent(item.projectId)}/info/`).then((res: any) => {
      const data = res.data;

      this.addProjectTemp.showModalToShowProjectInfo({
        projectName: data.projectName,
        sceneId: data.sceneId,
        nodeList: data.nodeList,
      });
    }).catch((e: any) => { });
  }

  public taskAction(type: any, item: any) {
    if (type === 'create') {
      // user-guide 恢复新增task按钮状态
      const flogin = sessionStorage.getItem('userGuidStatus-sys-perf');
      if (flogin === '0') {
        this.wizarding = false;
      }

      sessionStorage.setItem('projectId', item.projectId);
    } else {
      sessionStorage.setItem('projectId', item.parentNode.projectId);
    }
    let projectId;
    if (Object.prototype.hasOwnProperty.call(item, 'parentNode')) {
      projectId = item.parentNode.projectId;
    } else {
      projectId = item.projectId;
    }
    this.Axios.axios.get(`${this.url.project}${projectId}/info/`).then((data: any) => {
      if (!this.isDiagnose) {
        this.scenes = Util.judgeScene(data.data.sceneId);
      }
      this.operateTask.emit({
        type, // add start restart edit stop delete
        task: item,
        scenes: this.scenes,
      });
    });

  }
  public autoupdateProjectDetail() {
    clearInterval(this.updateProjectDetailInterval);

    this.updateProjectDetailInterval = setInterval(() => {
      const temp: any = [];
      this.tree.forEach((item) => {
        if (item.expanded) {
          temp.push(item);
        }
      });
      this.updateProjectDetail(temp, false);
    }, 2400);
  }
  public async updateProjectDetail(itemList: any, showLoading = false): Promise<any> {
    // itemList:需要更新的工程信息数组，无感知的更新传入的列表的菜单树
    if (itemList.length <= 0 || this.deletingProject) {
      return false;
    }
    const oldtree = itemList; // oldtree
    const projectNameList: any = [];
    const tempTree: any = [];
    oldtree.forEach((item: any) => {
      projectNameList.push(item.projectName);
      this.tree.forEach((node) => {
        if (node.label === item.projectName) {
          tempTree.push(node);
        }
      });
    });
    const projectNameListString = projectNameList.join(',');
    const data = await this.getProjectListInfo(
      projectNameListString,
      showLoading
    );
    // 更新数据
    const newTreeItem: any = {};
    data.data.forEach((item: any) => {
      const oldProject = oldtree.find((treeItem: any) => treeItem.projectName === item.projectname);
      // 将请求会来的数据处理为菜单树
      item.projectName = item.projectname;
      item.projectId = this.getProjectId(item);
      item.tasklist.sort(
        (a: any, b: any) => (this.getDate(b.createtime).getTime() - this.getDate(a.createtime).getTime())
      ).map((node: any) => {
        node.parent = item.projectname;
        node.ownerId = item.ownerid;
        node.label = node.taskname;
        node.parentNode = item;
        node.status = node['task-status'];
        node.nodeList.map((node2: any) => {
          node2.label = `${node2.nodeNickName}`;
          node2.expanded = false;
          node2.level = 'node';
          node2.taskId = node.id;
          node2.isImport = oldProject.isImport;
          node2.hilight =
            this.getChecked(tempTree, node.parent, node.label, node2.label) ||
            false;
        });
        node.children = node.nodeList;
        node.expanded =
          this.getExpanded(tempTree, node.parent, node.label) || false;
        node.level = 'task';
        node.isImport = oldProject.isImport;
      });
      newTreeItem[item.projectname] = item.tasklist;
    });

    if (newTreeItem != null) {
      Object.keys(newTreeItem).forEach(key => {
        this.tree.forEach((item) => {
          if (item.label === key) {
            item.children = newTreeItem[key];
          }
        });
      });
    }
  }
  async getProjectListInfo(projectNameListString: any, showLoading: any) {
    return this.Axios.axios.get(
      this.url.task + '?analysis-type=all&project-name=' +
      encodeURIComponent(projectNameListString) +
      '&auto-flag=on' +
      '&page=1' +
      '&per-page=1000',
      { headers: { showLoading } }
    );
  }
  public getProjectId(item: any) {
    let projectId;
    this.tree.forEach((project) => {
      if (project.projectName === item.projectName) {
        projectId = project.projectId;
      }
    });
    return projectId;
  }
  public getExpanded(tree: any, parentName: any, nodeName?: any) {
    // 获取节点在tree中的Expanded状态
    let res = false;
    try {
      if (nodeName) {
        tree.forEach((val: { label: any; children: any[]; }) => {
          if (val.label === parentName) {
            val.children.some(el => {
              if (el.label === nodeName) {
                res = el.expanded;
                return true;
              } else {
                return false;
              }
            });
          }
        });
      } else {
        tree.some((el: { label: any; expanded: boolean; }) => {
          if (el.label === parentName) {
            res = el.expanded;
            return true;
          } else {
            return false;
          }
        });
      }
      return res;
    } catch (error) {
      return false;
    }
  }
  public getChecked(tree: any, projectName: any, taskName: any, nodeName: any) {
    // 获取节点在tree中的Expanded状态
    let res = false;
    try {
      tree.forEach((project: any) => {
        if (project.label === projectName) {
          project.children.forEach((task: any) => {
            if (task.label === taskName) {
              task.children.forEach((node: any) => {
                if (node.label === nodeName) {
                  if (node.hilight === undefined) {
                    return false;
                  } else {
                    res = node.hilight;
                    return node.hilight;
                  }
                }
              });
            }
          });
        }
      });
      return res;
    } catch (error) {
      return false;
    }
  }

  // -- 展示工程的节点信息 --
  public getExplorer(): any {
    const explorer = window.navigator.userAgent;
    const ie11 = 'ActiveXObject' in window;

    if (explorer.indexOf('MSIE') >= 0 || ie11) {
      return 'ie';
    } else if (explorer.indexOf('Firefox') && !ie11) {
      return 'Firefox';
    } else if (explorer.indexOf('Chrome') && !ie11) {
      return 'Chrome';
    } else if (explorer.indexOf('Opera') && !ie11) {
      return 'Opera';
    } else if (explorer.indexOf('Safari') && !ie11) {
      return 'Safari';
    }
  }

  public getTaskStatus(status: any) {
    // 获取任务状态对应的中文名
    let statusMessage = '';
    switch (status) {
      case 'Created':
        statusMessage = this.i18n.status_Created;
        break;
      case 'Waiting':
        statusMessage = this.i18n.status_Waiting;
        break;
      case 'Sampling':
        statusMessage = this.i18n.status_Sampling;
        break;
      case 'Analyzing':
        statusMessage = this.i18n.status_Analyzing;
        break;
      case 'Stopping':
        statusMessage = this.i18n.status_Stopping;
        break;
      case 'Aborted':
        statusMessage = this.i18n.status_Aborted;
        break;
      case 'Failed':
        statusMessage = this.i18n.status_Failed;
        break;
      case 'Completed':
        statusMessage = this.i18n.status_Completed;
        break;
      case 'on':
        statusMessage = this.i18n.status_Online;
        break;
      case 'off':
        statusMessage = this.i18n.status_Offline;
        break;
      case 'Cancelled':
        statusMessage = this.i18n.status_Cancelled;
        break;
      case 'Cancelling':
        statusMessage = this.i18n.status_Cancelling;
        break;
      default:
        statusMessage = '';
    }
    return statusMessage;
  }

  // -- 导出任务 --
  public exportTask() {
    this.exportTaskModel.open();
  }

  // -- 导入任务 --
  public importTask() {
    this.importTaskModel.open();
  }

  /**
   * 从2021-05-29 12:08:57格式的时间字符串创建Date对象
   */
  private getDate(dateString: string) {
    const ymdArr = dateString.split(' ')[0].split('-');
    const hmsArr = dateString.split(' ')[1].split(':');
    return new Date(+ymdArr[0], +ymdArr[1] - 1, +ymdArr[2], +hmsArr[0], +hmsArr[1], +hmsArr[2]);
  }
  /**
   * 根据diagnostic-type字段判断当前诊断内容
   * @param taskInfo 任务节点数据
   * @returns 诊断内容
   */
  public getdiagnoseContent(taskInfo: any): string {
    const list = taskInfo['diagnostic-type'] || [];
    let str = '';
    str += list.indexOf('mem_leak') > -1 ? this.i18n.diagnostic.taskParams.memory_leakage + '、' : '';
    str += list.indexOf('mem_consume') > -1 ? this.i18n.diagnostic.taskParams.memory_consumption + '、' : '';
    str += list.indexOf('oom') > -1 ? 'OOM' + '、' : '';
    str += list.indexOf('mem_exception') > -1 ? this.i18n.diagnostic.taskParams.memory_abnormal + '、' : '';
    str += list.indexOf('packetLoss') > -1 ? this.i18n.network_diagnositic.taskParams.packet_loss + '、' : '';
    str += list.indexOf('netCaught') > -1 ? this.i18n.network_diagnositic.taskParams.network_capture + '、' : '';
    str += list.indexOf('load') > -1 ? this.i18n.network_diagnositic.taskParams.network_load + '、' : '';
    str += list.indexOf('connection') > -1 ||
      list.indexOf('tcp') > -1 || list.indexOf('udp') > -1
      ? this.i18n.network_diagnositic.taskParams.network_dial_test + '、' : '';
    str += list.indexOf('storageDiagnostic') > -1 ? this.i18n.storageIo.storage_io + '、' : '';
    str += list.indexOf('systemMonitor') > -1 ? this.i18n.storageIo.sys_load + '、' : '';
    return str.substring(0, str.length - 1);
  }

  /**
   * 折叠某些层级的节点
   * @param nodeList 节点列表
   * @param levels 层级数组
   */
  private collapseLevelNode(nodeList: Array<TiTreeNode>, levels: string[]) {
    const findNode = (node: TiTreeNode) => {
      if (null == node.children) {
        return;
      }
      if (levels.includes(node.level)) {
        node.expanded = false;
      }
      node.children?.forEach(item => {
        findNode(item);
      });
    };

    nodeList.forEach(node => {
      findNode(node);
    });
  }
}
