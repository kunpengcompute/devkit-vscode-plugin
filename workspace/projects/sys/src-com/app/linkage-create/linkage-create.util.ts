import { TiTreeUtil } from '@cloud/tiny3';
import { LinkageTreeNode, ComparisonAnalysisNode } from './domain';
import { Cat } from 'hyper';
import { AbstractControl } from '@angular/forms';

export class LinkageCreateUtil {

  private constructor() { }

  /**
   * 原始工程树的接口数据
   * @param projectTree 工程树的接口数据
   * @returns 联合分析所需的工程树的接口数据
   */
  static getLinkageTree(projectTree: any[], analysisType: string, sceneArray: any[]): LinkageTreeNode[] {
    return projectTree
      .filter((project: any) => {
        return sceneArray.includes(project.scene_id);
      })
      .map((project: any) => {
        return {
          level: 'project' as any,
          label: project.projectname,
          numFunction: project.numFunction,
          sceneId: project.scene_id,
          children: project.tasklist
            .filter((task: any) => {
              return task['task-status'] === 'Completed'
                && task['analysis-type'] === analysisType;
            })
            .map((task: any) => {
              return {
                level: 'task',
                label: task.taskname,
                taskId: task.id,
                sceneId: project.scene_id,
                children: task.nodeList
                  .filter((node: LinkageTreeNode) => {
                    return node.sampleStatus === 'Completed';
                  })
                  .map((node: LinkageTreeNode) => {
                    return {
                      level: 'node',
                      nodeId: node.nodeId,
                      label: node.nodeNickName,
                    };
                  })
              };
            }),
        };
      })
      .filter((project: any) => {
        return project.children.length > 0;
      });
  }

  /**
   * 设置横向分析节点的使能状态
   * @param treeNodeList 节点列表
   * @returns void
   */
  static setHoriAnalysisNodeState(treeNodeList: Array<LinkageTreeNode>) {

    const selectedNodes =
      TiTreeUtil.getSelectedData(treeNodeList, false, true) as LinkageTreeNode[];

    if (Cat.isEmpty(selectedNodes)) {
      this.enableAllNode(treeNodeList);
      return;
    }

    const disableHoriNodes = (nodeList: Array<LinkageTreeNode>) => {

      (nodeList ?? []).forEach(node => {

        if (node.level === 'task' && !node.checked) {
          (node.children ?? []).forEach(chlid => {
            chlid.disabled = true;
          });
        }

        disableHoriNodes(node.children);
      });
    };

    disableHoriNodes(treeNodeList);
  }

  /**
   * 设置纵向分析节点的使能状态
   * @param treeNodeList 节点列表
   * @returns void
   */
  static setVertAnalysisNodeStete(treeNodeList: Array<LinkageTreeNode>) {

    const selectedNodes =
      TiTreeUtil.getSelectedData(treeNodeList, false, true) as LinkageTreeNode[];
    const nodeNum = selectedNodes.length;

    const enableVertNodes = (nodeList: Array<LinkageTreeNode>, enabled: boolean) => {

      (nodeList ?? []).forEach(node => {
        if (node.level === 'task' && !node.checked) {
          (node.children ?? []).forEach(chlid => {
            chlid.disabled = !enabled;
          });
        }
        enableVertNodes(node.children, enabled);
      });
    };

    switch (true) {
      case nodeNum > 2:
        return;
      case nodeNum === 2:
        LinkageCreateUtil.disablePeerNodes(treeNodeList);
        enableVertNodes(treeNodeList, false);
        break;
      case nodeNum < 2:
        LinkageCreateUtil.disablePeerNodes(treeNodeList);
        enableVertNodes(treeNodeList, true);
        break;
      default:
    }
  }


  /**
   * 验证节点列表的正确性
   * @param list 节点列表
   * @returns 节点列表是否pass
   */
  static validHoriList(list: ComparisonAnalysisNode[]): boolean {

    const taskMap = this.getAnalysisTaskNumMap(list);
    const isOneTask = taskMap.size < 2;
    const isMoreNode = Array.from(taskMap.values()).some(item => item > 1);

    return isOneTask && isMoreNode;
  }

  /**
   * 验证节点列表的正确性
   * @param list 节点列表
   * @returns 节点列表是否pass
   */
  static validVertList(list: ComparisonAnalysisNode[]): boolean {

    const taskMap = this.getAnalysisTaskNumMap(list);
    const isOneTask = taskMap.size < 2;
    const isMoreNode = Array.from(taskMap.values()).some(item => item > 1);

    return !isOneTask && !isMoreNode;
  }

  /**
   * 将输入控件的值中的前后的空格去掉
   * @param control 文本输入控件
   */
  static trimTextInput(control: AbstractControl) {

    control.valueChanges.subscribe({
      next: (value) => {
        const text: string = value ?? '';
        if (text.startsWith(' ') || text.endsWith(' ')) {
          control.setValue(text.trim(), { emitEvent: false });
        }
      }
    });
  }

  /**
   * 根据对比分析节点的列表，返回对比分析任务与其数目的map
   * @param list 对比分析节点的列表
   * @returns 对比分析任务与其数目的map
   */
  private static getAnalysisTaskNumMap(list: ComparisonAnalysisNode[])
    : Map<ComparisonAnalysisNode['task_id'], number> {

    const taskMap = new Map<ComparisonAnalysisNode['task_id'], number>();

    list.forEach(item => {
      const nodeNum = taskMap.has(item.task_id) ? taskMap.get(item.task_id) + 1 : 1;
      taskMap.set(item.task_id, nodeNum);
    });

    return taskMap;
  }

  /**
   * 使能所有的节点
   * @param treeNodeList 节点列表
   */
  private static enableAllNode(treeNodeList: Array<LinkageTreeNode>) {

    (treeNodeList ?? []).forEach(node => {

      node.disabled = false;
      this.enableAllNode(node.children);
    });
  }

  /**
   * 使能没有选中的兄弟节点
   * @param nodeList 节点列表
   */
  private static disablePeerNodes(nodeList: Array<LinkageTreeNode>) {
    (nodeList ?? []).forEach(node => {
      if (node.level === 'task' && node.checked === 'indeterminate') {
        (node.children ?? []).forEach(chlid => {
          chlid.disabled = !chlid.checked;
        });
      }
      LinkageCreateUtil.disablePeerNodes(node.children);
    });
  }

}
