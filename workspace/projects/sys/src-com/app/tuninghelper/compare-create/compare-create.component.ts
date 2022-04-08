import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TiTreeUtil, TiMessageService } from '@cloud/tiny3';
import {
  HttpService, I18nService, CustomValidatorsService
} from 'sys/src-com/app/service';
import { LinkageCreateUtil } from './linkage-create.util';
import { LinkageTreeNode, ComparisonAnalysisNode } from './domain';
import { MessageModalService } from 'sys/src-com/app/service/message-modal.service';
import { GetTreeService } from 'sys/src-com/app/service/get-tree.service';
import { ToolType } from 'projects/domain';
import { Subject, Subscription } from 'rxjs';
import { TipService } from 'sys/src-com/app/service/index';
export const CreateCompareSub = new Subject<any>();

enum ComparisonType {
  Horizontal,
  Vertical
}

@Component({
  selector: 'app-compare-create',
  templateUrl: './compare-create.component.html',
  styleUrls: ['./compare-create.component.scss']
})
export class CompareCreateComponent implements OnInit {

  // 在任务创建后，返回任务创建的信息
  @Output() createdTask
    = new EventEmitter<{ status: string, taskId: number }>();
  // 关闭 tab 的触发
  @Output() closeTab = new EventEmitter<any>();
  public toolType: ToolType = sessionStorage.getItem('toolType') as ToolType;
  public ToolType = ToolType;
  public i18n: any;
  public isDisabled = true;
  public linkageTaskName: any;
  public activeTab = true;
  public horizontalTree: Array<LinkageTreeNode> = [];
  public verticalTree: Array<LinkageTreeNode> = [];
  public parentCheckable = false;
  public multiple = true;
  public tasktype = 'horizontal';
  // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
  public selectedData: Array<LinkageTreeNode>;
  public nickName: string;
  public horizontalList: ComparisonAnalysisNode[] = [];
  public verticalList: ComparisonAnalysisNode[] = [];
  public comparisonType = ComparisonType;
  public currComparisonType: ComparisonType = ComparisonType.Horizontal;
  public currentcompareList: ComparisonAnalysisNode[] = [];
  public treeSelectValid = false;
  public loginId = sessionStorage.getItem('loginId');
  // 工程树信息
  private projectTree: any;


  constructor(
    private tiMessage: MessageModalService,
    private http: HttpService,
    private i18nService: I18nService,
    public getTreeService: GetTreeService,
    private tipServe: TipService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  async ngOnInit() {
    const resp = await this.http.get('/data-comparison/optimization-tasks/');
    this.projectTree = resp.data;
    this.getTree(this.projectTree);
  }

  public onNgModelChange(event: any): void {
    this.getTree(this.projectTree);
  }

  public getTree(projectTree: any) {
    const tree = LinkageCreateUtil.getLinkageTree(projectTree);
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
      const objectName = projectName + '/' + taskName + '/' + item.label;
      this.horizontalList.push({
        project_name: projectName, task_name: taskName,
        task_id: taskId, node_id: nodeId, objectName
      });
    });
    this.currentcompareList = this.horizontalList;
    this.nickName = this.selectedData?.[0]?.label;
    this.validTreeSelect();
  }

  public onVerticalTreeSelect(node: LinkageTreeNode): void {

    this.selectedData = TiTreeUtil.getSelectedData(
      this.verticalTree, false, true
    ) as LinkageTreeNode[];

    LinkageCreateUtil.setVertAnalysisNodeStete(this.verticalTree);
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
      });
      const objectName = projectName + '/' + taskName + '/' + item.label;
      this.verticalList.push({
        project_name: projectName,
        task_name: taskName, task_id: taskId, node_id: nodeId, objectName
      });
    });
    this.currentcompareList = this.verticalList;
    this.nickName = this.selectedData?.[0]?.label;
    this.validTreeSelect();
  }

  // 切换Tab
  public changeTab(val: boolean) {
    this.activeTab = val;
    // 默认横向分析
    if (val) {
      this.tasktype = 'horizontal';
      this.currComparisonType = ComparisonType.Horizontal;
      this.currentcompareList = this.horizontalList;
    } else {
      this.tasktype = 'vertical';
      this.currComparisonType = ComparisonType.Vertical;
      this.currentcompareList = this.verticalList;
    }
    this.validTreeSelect();
  }

  // 关闭、取消
  public closeTask() {
    this.closeTab.emit({});
  }

  // 发送创建请求
  public createTask(params: any) {
    this.http.post('/data-comparison/create-comparison-data/', params)
      .then((data: any) => {
        this.closeTab.emit({
          title: data.data.compare_name,
          taskname: data.data.compare_name,
          id: data.data.id,
          taskId: data.data.id,
          status: data.data.status,
          projectName: `COMPARE_${data.data.id}`,
          'analysis-type': 'tuninghelperCompare',
          taskType: 'tuninghelperCompare',
          ownerId: this.loginId
        });
        if (data.code === 'SysPerf.Success') {
          CreateCompareSub.next({ status: 'success', taskId: data.data.id, newTag: true });
        }
      })
      .catch((error) => {
        if (document.body.className.includes('vscode')) {
          this.tipServe.alertInfo({
            type: 'error',
            content: error.message,
            time: 3500
          });
        } else {
          const modal = this.tiMessage.open({
            modalClass: 'compare-create-repeats-modal',
            type: 'error',
            title: this.i18n.tip_msg.task_create_error,
            content: this.i18n.tip_msg.task_create_error_content,
            okButton: {
              show: false,
            },
            cancelButton: {
              show: true,
              text: this.i18n.common_term_operate_close,
              click: (): void => {
                modal.close();
              }
            },
          });
        }
      });
  }

  // 确认添加联动分析任务
  public addNewLinkage(): void {
    const params = {
      dimension: this.tasktype || 'horizontal',
      comparisonParams: this.currentcompareList.map((val) => {
        return {
          id: val.task_id,
          nodeId: val.node_id,
        };
      })
    };

    if (this.selectedData.length !== 2) {
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

  /**
   * 切换对比分析对象顺序
   */
  public exchangeObj() {
    this.currentcompareList.reverse();
  }
}

