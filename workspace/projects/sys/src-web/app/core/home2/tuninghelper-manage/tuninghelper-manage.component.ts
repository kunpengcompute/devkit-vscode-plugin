import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { OpenNodeInfo } from './domain';
import {
  Component,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {
  TiTreeComponent,
  TiTreeNode,
  TiTreeUtil,
} from '@cloud/tiny3';
import { MytipService } from 'sys/src-web/app/service/mytip.service';
import { I18nService } from 'sys/src-web/app/service/i18n.service';
import { AxiosService } from 'sys/src-web/app/service/axios.service';
import { ScheduleTaskService } from 'sys/src-web/app/service/schedule-task.service';
import { TuninghelperManageService } from './services/tuninghelper-manage.service';
import { AnalysisScene } from 'sys/src-web/app/domain';
import { Subscription } from 'rxjs';
import { MessageModalService } from 'sys/src-web/app/service/message-modal.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { MessageService } from 'sys/src-web/app/service/message.service';

@Component({
  selector: 'app-tuninghelper-manage',
  templateUrl: './tuninghelper-manage.component.html',
  styleUrls: ['./tuninghelper-manage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TuninghelperManageComponent implements OnInit, OnDestroy {

  @ViewChild('TREE') TREE: any;
  @ViewChild('addProjectTemp') addProjectTemp: any;
  @ViewChild('deleteModal') deleteModal: any;

  @Output() operateTask = new EventEmitter();
  @Output() setDeletingProject = new EventEmitter();
  @Output() selectNode = new EventEmitter();
  @Output() sendTreeData = new EventEmitter();

  private url: any;
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
  public tree: Array<TiTreeNode> = [];
  public scenes: AnalysisScene;
  public userGuideStep: Subscription;
  public openNodeSub: Subscription;
  public msgSub: Subscription;
  // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
  selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
    this.tree,
    false,
    false
  );
  public timeoutId: any;
  public taskTipContext = {
    taskName: '',
    analysisObject: '',
    analysisType: '',
  };
  // 删除 -- 采集中、分析中状态不能删除
  // 再次分析 -- 完成状态才可以
  // 查看分析路径 -- 所有状态都能查看分析路径，但是非Completed状态无优化建议
  public taskOperate = {
    reanalyze: ['Completed'],
    stop: ['Sampling'],
    delete: ['Created', 'Waiting', 'Stopping', 'Cancelling', 'Completed', 'Failed', 'running', 'Cancelled']
  };

  constructor(
    public timessage: MessageModalService,
    public mytip: MytipService,
    public i18nService: I18nService,
    private urlService: UrlService,
    public Axios: AxiosService,
    public leftShowService: LeftShowService,
    public projectId: ScheduleTaskService,
    private openNodeService: TuninghelperManageService,
    private messageService: MessageService
  ) {
    this.url = this.urlService.Url();
    this.i18n = this.i18nService.I18n();

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
    this.msgSub = this.messageService.getMessage().subscribe((msg: any) => {
      if (msg.type === 'tuningAssistantProjectSuccess') {
        this.updateProjectState();
      } else if (msg.type === 'tuningAssistantTaskSuccess') {
        const expandedProjectList = this.getCurExpandedProjectList();
        this.updateProjectDetail(expandedProjectList, false);
      }
    });
  }

  /**
   * 初始化
   */
  ngOnInit() {
    this.userInfo.id = sessionStorage.getItem('loginId');
    this.userInfo.role = sessionStorage.getItem('role');
    this.getProjectList('off');
    // 定时刷新工程列表
    this.updateProjectStateInterval = setInterval(() => {
      this.updateProjectState();
    }, 10000);
    this.autoupdateProjectDetail();
  }

  /**
   * 调优助手-获取工程列表
   */
  public getProjectList(auto = 'off') {
    const params = {
      'auto-flag': auto,
      date: Date.now(),
      'analysis-type': 'optimization'
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
        });
      });
      this.sendTreeData.emit(temp);
      this.tree = temp;
    });
  }

  /**
   * 展开树结构-异步请求数据后插入当前节点并展开
   * @param TreeCom 树节点信息
   */
  beforeExpand(TreeCom: TiTreeComponent): void {
    // 1.获取当前点击节点
    const item: TiTreeNode = TreeCom.getBeforeExpandNode();
    if (item.level === 'project') {
      sessionStorage.setItem('projectId', item.projectId);
      this.getProjectDetail(item);
    } else if (item.level === 'task') {
      item.children = item.children;
      item.expanded = true;
    }
  }

  /**
   * 获取工程下全部任务信息
   * @param item 工程数据
   */
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
            node2.task = node;
            node2.isImport = item.isImport;
            node2.ownerId = node.ownerId;
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

  /**
   * 获取工程下任务信息请求载体
   */
  getNodeData(item: any): any {
    if (!this.deletingProject) {
      return this.Axios.axios.get(
        this.url.task + '?analysis-type=optimization&project-name=' +
        encodeURIComponent(item.projectName) +
        '&auto-flag=off' +
        '&page=1' +
        '&per-page=1000'
      );
    }
  }

  /**
   * 刷新工程列表
   */
  public updateProjectState() {
    return new Promise((resolve, reject) => {
      const params = {
        'auto-flag': 'on',
        date: Date.now(),
        'analysis-type': 'optimization'
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
          };
        });

        resolve(data);
      });
    });
  }

  /**
   * 鼠标悬浮提示任务-获取任务信息
   * @param e 鼠标选中ev
   * @param item 任务信息
   */
  public getTipInfo(e: any, item: any): void {
    this.taskTipContext.taskName = item.taskname || item['task-name'];
    const analysisObject = item['analysis-target'] || item.analysisTarget;
    if (!analysisObject || analysisObject === 'Profile System') {
      this.taskTipContext.analysisObject = this.i18n.common_term_projiect_task_system;
    } else {
      this.taskTipContext.analysisObject = this.i18n.common_term_task_crate_path;
    }
  }

  /**
   * 清除任务所有节点高亮颜色
   */
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

  /**
   * 树结构-点击节点事件
   */
  onSelect(event: TiTreeNode, manuals?: any): void {
    this.clearHilight();

    // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
    this.selectedData = TiTreeUtil.getSelectedData(this.tree, false, false);

    if (event.level === 'project') {
      sessionStorage.setItem('projectId', event.projectId);
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

  /**
   * 删除工程:1弹出确认弹窗
   */
  public async deleteProject(item: any) {
    const list =  await this.deleteModal.deleteBefore(item.projectId, false);
    if (list.length > 0){
      this.deleteModal.deleteModel(false, list, item.projectName, item);
      return;
    }
    const self = this;
    this.timessage.open({
      type: 'warn',
      modalClass: 'project-del',
      title: this.i18n.common_term_delete_title,
      content: this.i18n.common_term_delete_content,
      okButton: {
        autofocus: false,
        primary: false,
      },
      cancelButton: {
        autofocus: true,
        primary: true,
      },
      close() {
        self.doDeleteProjrcts(item.projectId, item);
      },
    });
  }

  /**
   * 确认删除工程
   * @param id 工程id
   * @param items 工程数据
   */
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

  /**
   * 工程&任务操作事件
   * @param type 操作类型
   * @param item 任务数据
   */
  public operateAction(type: any, item: any) {
    let projectData: any;
    if (item.level === 'project') {
      projectData = item;
    } else if (item.level === 'task') {
      projectData = item.parentNode;
    } else {
      projectData = item.task.parentNode;
    }
    sessionStorage.setItem('projectId', projectData.projectId);
    this.Axios.axios.get(`${this.url.project}${projectData.projectId}/info/`).then((data: any) => {
      this.operateTask.emit({
        type, // add start restart edit stop delete
        task: item,
        project: projectData,
        scenes: this.scenes,
      });
    });

  }
  public closeModal(context: any){
    this.doDeleteProjrcts(context.item.projectId, context.item);
  }
  /**
   * 定时请求更新展开工程下任务数据
   */
  public autoupdateProjectDetail() {
    clearInterval(this.updateProjectDetailInterval);

    this.updateProjectDetailInterval = setInterval(() => {
      const expandedProjectList = this.getCurExpandedProjectList();
      this.updateProjectDetail(expandedProjectList, false);
    }, 2400);
  }

  /**
   * 获取当前已经展开的工程列表
   */
  public getCurExpandedProjectList() {
    const temp: any = [];
    this.tree.forEach((item) => {
      if (item.expanded) {
        temp.push(item);
      }
    });
    return temp;
  }

  /**
   * 根据工程获取需要更新的任务数据
   * @param itemList 已展开工程列表
   * @param showLoading 是否需要展示loading动画
   */
  public async updateProjectDetail(itemList: any, showLoading = false): Promise<any> {
    try {
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
      if (projectNameList.length === 0) {
        return false;
      }
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
            node2.task = node;
            node2.isImport = oldProject.isImport;
            node2.hilight =
              this.getChecked(tempTree, node.parent, node.label, node2.label) ||
              false;
            node2.ownerId = node.ownerId;
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
    } catch {
    }
  }

  /**
   * 获取工程下任务信息请求载体
   */
  async getProjectListInfo(projectNameListString: any, showLoading: any) {
    return this.Axios.axios.get(
      this.url.task + '?analysis-type=optimization&project-name=' +
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

  /**
   * 获取任务状态对应的中文名
   */
  public getTaskStatus(status: any) {
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
        statusMessage = this.i18n.common_term_task_failed;
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
        statusMessage = this.i18n.common_term_task_analysis_canceled;
        break;
      case 'Cancelling':
        statusMessage = this.i18n.status_Cancelling;
        break;
      default:
        statusMessage = '';
    }
    return statusMessage;
  }

  /**
   * 从2021-05-29 12:08:57格式的时间字符串创建Date对象
   */
  private getDate(dateString: string) {
    const ymdArr = dateString.split(' ')[0].split('-');
    const hmsArr = dateString.split(' ')[1].split(':');
    return new Date(+ymdArr[0], +ymdArr[1] - 1, +ymdArr[2], +hmsArr[0], +hmsArr[1], +hmsArr[2]);
  }

  ngOnDestroy() {
    clearInterval(this.updateProjectStateInterval);
    clearInterval(this.updateProjectDetailInterval);
    this.userGuideStep?.unsubscribe();
    this.openNodeSub?.unsubscribe();
    this.msgSub?.unsubscribe();
  }

  /**
   * 创建工程
   */
  public addProject() {
    this.operateTask.emit({
      type: 'createTuninghelperProject',
      task: {},
    });
  }
}
