import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TiTreeNode, TiTreeUtil, TiValidators } from '@cloud/tiny3';
import { VscodeService } from '../../service/vscode.service';
import { Observable, Subscription } from 'rxjs';
import { GetTreeService } from '../../service/linkageServices/get-tree.service';
import { I18nService } from 'sys/src-ide/app/service/i18n.service';
import { HttpService } from 'sys/src-ide/app/service/http.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidatorsService } from 'projects/sys/src-ide/app/service';
import {
  ComparisonAnalysisNode, LinkageTreeNode
} from 'sys/src-com/app/linkage-create/domain';
import {
  LinkageCreateUtil
} from 'sys/src-com/app/linkage-create/linkage-create.util';
import { MessageModalService } from 'projects/sys/src-ide/app/service/message-modal.service';
import { HyTheme, HyThemeService } from 'hyper';

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

  @Input() nodeNickName: string;
  @Output() closeTab = new EventEmitter<any>();

  public i18n: any;
  public activeTab = true;
  public horizontalTree: Array<LinkageTreeNode> = [];
  public verticalTree: Array<LinkageTreeNode> = [];
  public parentCheckable = false;
  public createdTask: Subscription;
  public multiple = true;
  public tasktype = 'horizontal analysis';
  public selectedData: Array<TiTreeNode>;
  public tree: any;
  public myOptions: Array<any> = [];
  public mySelected: any = null;
  public scenes: Array<any> = [];
  public sceneArr: Array<any> = [];
  public noSceneChoice = false;
  private generalScenarioArray: Array<any> = [];
  private bigDataArray: Array<any> = [];
  private dataBaseArray: Array<any> = [];
  private distributedStorageArray: Array<any> = [];
  private set = new Set([]);

  horizontalList: ComparisonAnalysisNode[] = [];
  verticalList: ComparisonAnalysisNode[] = [];
  comparisonType = ComparisonType;
  currComparisonType: ComparisonType = ComparisonType.Horizontal;
  linkFormGroup: FormGroup;
  treeSelectValid = false;
  theme$: Observable<HyTheme>;
  // 工程树信息
  private projectTree: any;
  public clickSceneType(value: number){
    this.scenes[value].currentCreateType = !this.scenes[value].currentCreateType;
    let tmpSceneArr: Array<any> = [];
    // 创建场景id array
    this.noSceneChoice = true;
    for (const item of this.scenes){
      if (item.currentCreateType === true){
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
    public vscodeService: VscodeService,
    public getTreeService: GetTreeService,
    public i18nService: I18nService,
    public customValidatorsService: CustomValidatorsService,
    private fb: FormBuilder,
    private http: HttpService,
    private themeServe: HyThemeService
  ) {
    this.theme$ = this.themeServe.getObservable();
    this.i18n = this.i18nService.I18n();
    this.myOptions =
    [{label: this.i18n.mission_create.sysPro, analysisType: 'system'},
    {label: this.i18n.mission_create.cPlusPlus, analysisType: 'C/C++ Program'}];
    this.mySelected = this.myOptions[0];

    this.linkFormGroup = this.fb.group({
      taskName: ['', [this.customValidatorsService.taskNameValidator, TiValidators.required]],
    });
    LinkageCreateUtil.trimTextInput(this.linkFormGroup.get('taskName'));
  }

  async ngOnInit() {
    this.getSceneResp().then((res: any) => {
      this.scenes = [
        { name: this.i18n.linkage.generalScenario, currentCreateType: true,
        scene_id: this.generalScenarioArray },
        { name: this.i18n.linkage.bigData, currentCreateType: false,
        scene_id: this.bigDataArray },
        { name: this.i18n.linkage.dataBase, currentCreateType: false,
        scene_id: this.dataBaseArray },
        { name: this.i18n.linkage.distributedStorage, currentCreateType: false,
        scene_id: this.distributedStorageArray }];
      this.sceneArr = this.scenes[0].scene_id;
      this.getProjectTree(true);

    });
  }

  public getSceneIds(son: any){
    const tmpArray: any[] = [];
    son.children.forEach((element: any) => {
      element.children[0].forEach((bottomElement: any) => {
        tmpArray.push(bottomElement.Id);
      });
    });
    return tmpArray;
  }

  getSceneResp(){
    return new Promise((resolve, reject) => {
      const option = {
      url: '/projects/scene/'
      };
      this.vscodeService.get(option, (res: any) => {
        res.data.data.forEach((element: any) => {
          if (element.Id === 1){
            this.distributedStorageArray = this.getSceneIds(element);
          }
          else if (element.Id === 11){
            this.generalScenarioArray = [element.Id];
          }
          else if (element.Id === 101){
            this.bigDataArray = this.getSceneIds(element);
          }
          else if (element.Id === 401){
            this.dataBaseArray = [];
            element.children.forEach((elementChild: any) => {
              this.dataBaseArray.push(elementChild.Id);
            });
          }
        });
        resolve(res);
        });
    });
  }

  public onNgModelChange(event: any): void {
    this.getTree(this.projectTree);
  }

  private getTree(projectTree: any) {

    const tree = LinkageCreateUtil.getLinkageTree(projectTree,
      this.mySelected.analysisType, this.sceneArr);

    this.horizontalTree = JSON.parse(JSON.stringify(tree));
    this.verticalTree = JSON.parse(JSON.stringify(tree));
  }

  public onHorizontalTreeSelect(node: TiTreeNode): void {

    this.selectedData = TiTreeUtil.getSelectedData(this.horizontalTree, false, true);

    LinkageCreateUtil.setHoriAnalysisNodeState(this.horizontalTree);
    this.set = new Set([]);
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
        this.set.add(it.sceneId);
      });
      this.horizontalList.push({ project_name: projectName, task_name: taskName, task_id: taskId, node_id: nodeId });
    });
    this.validTreeSelect();
  }

  public onVerticalTreeSelect(node: TiTreeNode): void {

    this.selectedData = TiTreeUtil.getSelectedData(this.verticalTree, false, true);

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
  public createTask(params: any){
    const option = {
      url: '/tasks/taskcontrast/',
      params
    };
    this.vscodeService.post(option, (data: any) => {
      if (!data?.data?.id) {
        this.vscodeService.showInfoBox(data.message, 'error');
        return;
      }

      const opt = {
        url: `/tasks/${data.data.id}/status/`,
        params: { status: 'running' }
      };
      this.vscodeService.put(opt, (res: any) => {
        if (res.status) {
          this.vscodeService.showInfoBox(res.message, 'error');
        } else {
          this.closeTab.emit({
            title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
            id: res.data.id,
            nodeid: params.nodeConfig[0].nodeId,
            taskId: res.data.id,
            taskType: params['analysis-type'],
            status: res.data['task-status'],
            projectName: params.projectname
          });

          const successInfo =  this.i18nService.I18nReplace(
            this.i18n.plugins_term_task_create_success,
            { 0: params.taskname }
          );
          this.vscodeService.showInfoBox(successInfo, 'info');
        }
      });
    });
  }

  // 确认添加联动分析任务
  public addNewLinkage() {
    const loginId = (self as any).webviewSession.getItem('loginId');
    const params = {
      'analysis-type': 'task_contrast',
      tasktype: this.tasktype,
      projectname: `TASKCONTRAST_${loginId}`,
      taskname: this.linkFormGroup.get('taskName').value,
      analysis_list: this.currComparisonType === ComparisonType.Horizontal
        ? this.horizontalList
        : this.verticalList,
      nodeConfig: [
        {
          nodeId: 1,
          nickName: this.nodeNickName,
          task_param: {
            status: false,
            'analysis-type': 'task_contrast',
            projectname: `TASKCONTRAST_${loginId}`,
            taskname: this.linkFormGroup.get('taskName').value,
            analysis_list: this.currComparisonType === ComparisonType.Horizontal
              ? this.horizontalList
              : this.verticalList
          }
        }
      ]
    };

    if (this.selectedData.length === 2 && this.set.size === 2){
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

    }else{
      this.createTask(params);
    }
  }

  // 获取工程树
  async getProjectTree(init?: boolean) {
    const resp = await this.http.get(`/projects/?auto-flag=off&analysis-type=all`);
    const projectNameList: string[] = (resp.data.projects ?? []).map((item: any) => item.projectName);

    if (projectNameList.length < 1) { return; }

    const params = {
      'analysis-type': 'all',
      'project-name': projectNameList.join(','),
      'auto-flag': 'on',
      page: 1,
      'per-page': 1000
    };

    this.http.get('/tasks/task-summary/', { params })
   .then((res: any) => {
     this.projectTree = res.data;
     if (init){
      this.getTree(this.projectTree);
    }
   });
  }

  private validTreeSelect() {

    this.treeSelectValid
      = (this.currComparisonType === ComparisonType.Horizontal)
        ? LinkageCreateUtil.validHoriList(this.horizontalList)
        : LinkageCreateUtil.validVertList(this.verticalList);
  }
}
