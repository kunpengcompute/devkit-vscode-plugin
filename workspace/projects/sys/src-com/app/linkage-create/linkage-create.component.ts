import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TiTreeUtil, TiValidators } from '@cloud/tiny3';
import {
  HttpService, I18nService, CustomValidatorsService
} from 'sys/src-com/app/service';
import { LinkageCreateUtil } from './linkage-create.util';
import { LinkageTreeNode, ComparisonAnalysisNode } from './domain';
import { LinkageCreateDataService } from './service/linkage-create-data.service';
import { MessageModalService } from 'sys/src-com/app/service/message-modal.service';
import { GetTreeService } from 'sys/src-com/app/service/get-tree.service';

enum ComparisonType {
  Horizontal,
  Vertical
}

@Component({
  selector: 'app-linkage-create',
  templateUrl: './linkage-create.component.html',
  styleUrls: ['./linkage-create.component.scss']
})
export class LinkageCreateComponent implements OnInit {

  // 在任务创建后，返回任务创建的信息
  @Output() createdTask
    = new EventEmitter<{ status: string, taskId: number }>();
  // 关闭 tab 的触发
  @Output() closeTab = new EventEmitter<any>();

  public i18n: any;
  public isDisabled = true;
  public linkageTaskName: any;
  public activeTab = true;
  public horizontalTree: Array<LinkageTreeNode> = [];
  public verticalTree: Array<LinkageTreeNode> = [];
  public parentCheckable = false;
  public multiple = true;
  public tasktype: string;
  // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
  public selectedData: Array<LinkageTreeNode>;
  public nickName: string;
  public myOptions: Array<any> = [];
  public mySelected: any = null;
  public scenes: Array<any> = [];
  public sceneArr: Array<any> = [];
  public noSceneChoice = false;
  public horizontalList: ComparisonAnalysisNode[] = [];
  public verticalList: ComparisonAnalysisNode[] = [];
  public comparisonType = ComparisonType;
  public currComparisonType: ComparisonType = ComparisonType.Horizontal;
  public linkFormGroup: FormGroup;
  public treeSelectValid = false;
  public labelWidth = sessionStorage.getItem('language') === 'en-us' ? '210px' : '120px';
  // 工程树信息
  private projectTree: any;
  private generalScenarioArray: Array<any> = [];
  private bigDataArray: Array<any> = [];
  private dataBaseArray: Array<any> = [];
  private distributedStorageArray: Array<any> = [];
  private set = new Set([]);

  public clickSceneType(value: number) {
    this.scenes[value].currentCreateType = !this.scenes[value].currentCreateType;
    let tmpSceneArr: Array<any> = [];
    // 创建场景id array
    this.noSceneChoice = true;
    for (const item of this.scenes) {
      if (item.currentCreateType === true) {
        tmpSceneArr = tmpSceneArr.concat(item.scene_id);
        this.noSceneChoice = false;
      }
    }
    this.sceneArr = tmpSceneArr;
    // 重新调用this.getTree，构建两颗任务树
    this.getTree(this.projectTree);
    this.horizontalList = [];
    this.verticalList = [];
    this.validTreeSelect();
  }

  constructor(
    private tiMessage: MessageModalService,
    private http: HttpService,
    private i18nService: I18nService,
    private fb: FormBuilder,
    private validatorsServe: CustomValidatorsService,
    private dataService: LinkageCreateDataService,
    public getTreeService: GetTreeService,
  ) {

    this.i18n = this.i18nService.I18n();
    this.myOptions =
      [{ label: this.i18n.mission_create.sysPro, analysisType: 'system' },
      { label: this.i18n.mission_create.cPlusPlus, analysisType: 'C/C++ Program' }];
    this.mySelected = this.myOptions[0];

    this.linkFormGroup = this.fb.group({
      taskName: ['', [TiValidators.required, this.validatorsServe.taskNameValidator]],
    });
    LinkageCreateUtil.trimTextInput(this.linkFormGroup.get('taskName'));
  }

  async ngOnInit() {
    this.getSceneArray(this.getTreeService.sceneInfo);
    this.projectTree = await this.dataService.getProjectTree();
    this.getTree(this.projectTree);
  }

  public onNgModelChange(event: any): void {
    this.getTree(this.projectTree);
  }

  public getSceneIds(son: any) {
    const tmpArray: any[] = [];
    son.children.forEach((element: any) => {
      element.children[0].forEach((bottomElement: any) => {
        tmpArray.push(bottomElement.Id);
      });
    });
    return tmpArray;
  }

  public getSceneArray(sceneTree: any): void {
    sceneTree.forEach((element: any) => {
      if (element.Id === 1) {
        this.distributedStorageArray = this.getSceneIds(element);
      }
      else if (element.Id === 11) {
        this.generalScenarioArray = [element.Id];
      }
      else if (element.Id === 101) {
        this.bigDataArray = this.getSceneIds(element);
      }
      else if (element.Id === 401) {
        this.dataBaseArray = [];
        element.children.forEach((elementChild: any) => {
          this.dataBaseArray.push(elementChild.Id);
        });
      }
    });
    this.scenes = [{
      name: this.i18n.linkage.generalScenario, currentCreateType: true,
      scene_id: this.generalScenarioArray
    },
    {
      name: this.i18n.linkage.bigData, currentCreateType: false,
      scene_id: this.bigDataArray
    },
    { name: this.i18n.linkage.dataBase, currentCreateType: false, scene_id: this.dataBaseArray },
    {
      name: this.i18n.linkage.distributedStorage, currentCreateType: false,
      scene_id: this.distributedStorageArray
    }];
    this.sceneArr = this.scenes[0].scene_id;
  }

  public getTree(projectTree: any) {
    const tree = LinkageCreateUtil.getLinkageTree(projectTree,
      this.mySelected.analysisType, this.sceneArr);
    this.horizontalTree = JSON.parse(JSON.stringify(tree));
    this.verticalTree = JSON.parse(JSON.stringify(tree));
  }

  public onHorizontalTreeSelect(node: LinkageTreeNode): void {

    this.selectedData = TiTreeUtil.getSelectedData(
      this.horizontalTree, false, true
    ) as LinkageTreeNode[];

    LinkageCreateUtil.setHoriAnalysisNodeState(this.horizontalTree);

    let nodeId: number;
    let projectName: string;
    let taskId: number;
    let taskName: string;
    this.horizontalList = [];
    this.selectedData.forEach((item: any) => {
      nodeId = item.nodeId;
      item.parent.forEach((it: any) => {
        if (it.level === 'project') {
          projectName = it.label;
        }
        if (it.level === 'task') {
          taskId = it.taskId;
          taskName = it.label;
        }
      });
      this.horizontalList.push({ project_name: projectName, task_name: taskName, task_id: taskId, node_id: nodeId });
    });
    this.nickName = this.selectedData?.[0]?.label;
    this.validTreeSelect();
  }

  public onVerticalTreeSelect(node: LinkageTreeNode): void {

    this.selectedData = TiTreeUtil.getSelectedData(
      this.verticalTree, false, true
    ) as LinkageTreeNode[];

    LinkageCreateUtil.setVertAnalysisNodeStete(this.verticalTree);
    this.set = new Set([]);
    let nodeId: number;
    let projectName: string;
    let taskId: number;
    let taskName: string;
    this.verticalList = [];
    this.selectedData.forEach((item: any) => {
      nodeId = item.nodeId;
      item.parent.forEach((it: any) => {
        if (it.level === 'project') {
          projectName = it.label;
        }
        if (it.level === 'task') {
          taskId = it.taskId;
          taskName = it.label;
        }
        this.set.add(it.sceneId);
      });
      this.verticalList.push({ project_name: projectName, task_name: taskName, task_id: taskId, node_id: nodeId });
    });
    this.nickName = this.selectedData?.[0]?.label;
    this.validTreeSelect();
  }

  // 切换Tab
  public changeTab(val: boolean) {
    this.activeTab = val;
    // 默认横向分析
    if (val) {
      this.tasktype = 'horizontal analysis';
      this.currComparisonType = ComparisonType.Horizontal;
    } else {
      this.tasktype = 'vertical analysis';
      this.currComparisonType = ComparisonType.Vertical;
    }
    this.validTreeSelect();
  }

  // 关闭、取消
  public closeTask() {
    this.closeTab.emit({});
  }

  // 发送创建请求
  public createTask(params: any) {
    this.http.post('/tasks/taskcontrast/', params).then((data: any) => {
      this.http.put(`/tasks/${encodeURIComponent(data.data.id)}/status/`, { status: 'running' }).then((res: any) => {
        this.closeTab.emit({
          title: `${params.taskname}`,
          id: res.data.id,
          nodeid: params.nodeConfig[0].nodeId,
          taskId: res.data.id,
          taskType: params['analysis-type'],
          status: res.data['task-status'],
          projectName: params.projectname
        });
        if (res.code === 'SysPerf.Success') {
          this.createdTask.emit({ status: 'success', taskId: res.data.id });
        }
      });
    });
  }

  // 确认添加联动分析任务
  public addNewLinkage(): void {
    const loginId = sessionStorage.getItem('loginId');

    const params = {
      'analysis-type': 'task_contrast',
      tasktype: this.tasktype || 'horizontal analysis',
      projectname: `TASKCONTRAST_${loginId}`,
      taskname: this.linkFormGroup.get('taskName').value,
      analysis_list: this.currComparisonType === ComparisonType.Horizontal
        ? this.horizontalList
        : this.verticalList,
      nodeConfig: [
        {
          nodeId: 1,
          nickName: this.nickName,
          task_param: {
            status: false,
            'analysis-type': 'task_contrast',
            projectname: `TASKCONTRAST_${loginId}`,
            taskname: this.linkFormGroup.get('taskName').value,
            analysis_list: this.currComparisonType === ComparisonType.Horizontal
              ? this.horizontalList
              : this.verticalList,
          }
        }
      ]
    };

    if (this.selectedData.length === 2 && this.set.size === 2) {
      this.tiMessage.open({
        type: 'prompt',
        title: this.i18n.linkage.prompt,
        content: this.i18n.linkage.notSameScene,
        okButton: {
          text: this.i18n.common_term_operate_ok,
        },
        close: (): void => {
          this.createTask(params);
        },
        cancelButton: {
          show: false,
        },
      });

    } else {
      this.createTask(params);
    }
  }

  private validTreeSelect() {

    this.treeSelectValid
      = (this.currComparisonType === ComparisonType.Horizontal)
        ? LinkageCreateUtil.validHoriList(this.horizontalList)
        : LinkageCreateUtil.validVertList(this.verticalList);
  }
}
