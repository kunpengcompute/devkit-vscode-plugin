import {
  Component,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TiModalRef, TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import {
  BatchNodeInfo,
  BatchOptEvent,
  BatchOptType,
  NodeFingerprint,
  ProjectNodesShip,
  ProjectNodesShipRaw,
} from '../../domain';
import {
  StateController,
  DispatchInfo,
  StateBaseOpreation,
  OpenModelFn,
} from '../../model';
import { BehaviorSubject, Subject } from 'rxjs';
import { ToolType } from 'projects/domain';
import { I18n } from 'sys/locale';
import { HyMiniModalService } from 'hyper';

const toolTypeMap = new Map<string, ToolType>([
  ['projectList', ToolType.SYSPERF],
  ['memoryProjectList', ToolType.DIAGNOSE],
  ['optimizationProjectList', ToolType.TUNINGHELPER],
]);

const attributionToolMap = new Map<ToolType, string>([
  [ToolType.SYSPERF, I18n.common_term_pro_name],
  [ToolType.DIAGNOSE, I18n.common_term_mem_name],
  [ToolType.TUNINGHELPER, I18n.common_tern_tunning_helper_name],
]);

@Component({
  selector: 'app-project-relation',
  templateUrl: './project-relation.component.html',
  styleUrls: ['./project-relation.component.scss'],
})
export class ProjectRelationComponent implements OnInit, StateBaseOpreation {
  @ViewChild('batchModal', { static: true }) batchModalTpl: TemplateRef<any>;

  @Output() inited = new BehaviorSubject<StateController>(null);
  @Output() dispatch = new Subject<DispatchInfo>();
  // 批量操作类型
  batchOptType: BatchOptType;
  batchOptTypeEnum = BatchOptType;
  table: any = {
    displayed: [] as Array<TiTableRowData>,
    srcData: {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false, // 源数据未进行分页处理
      },
    },
    columns: [] as Array<TiTableColumns>,
    pageNo: 1,
    pageSize: {
      options: [10, 20, 40, 80, 100],
      size: 10,
    },
    total: 0,
  };

  attributionTool = attributionToolMap;
  private payLoad: {
    nodeInfo: BatchNodeInfo[];
    fingerPrint: NodeFingerprint[];
    relation: ProjectNodesShipRaw;
  };
  private openModelRef: TiModalRef;

  constructor(private miniModal: HyMiniModalService) {
    this.table.columns = [
      { label: I18n.nodeManagement.projectName, prop: 'projectname' },
      { label: I18n.nodeManagement.attributionTool, prop: 'toolType' },
      { label: I18n.nodeManagement.nodeInformation, prop: 'related_node' },
    ];
  }

  ngOnInit(): void {
    this.inited.next({
      action: (
        payLoad: {
          nodeInfo: BatchNodeInfo[];
          fingerPrint: NodeFingerprint[];
          relation: ProjectNodesShipRaw;
        },
        openModel: OpenModelFn
      ) => {
        this.payLoad = payLoad;
        this.table.srcData.data = this.getProjectNodesShipList(
          payLoad.relation
        );
        this.table.total = this.table.srcData.data.length;

        this.openModelRef = openModel(this.batchModalTpl, {
          dismiss: () => {
            this.dispatch.next({
              event: BatchOptEvent.Cancel,
            });
          },
        });
      },
    });
  }

  onCancel(_: any) {
    this.miniModal.open({
      type: 'warn',
      content: {
        title:
          BatchOptType.Import === this.batchOptType
            ? I18n.nodeManagement.cancelImport
            : I18n.nodeManagement.cancelDelet,
        body:
          BatchOptType.Import === this.batchOptType
            ? I18n.nodeManagement.cancelImportWarn
            : I18n.nodeManagement.cancelDeletWarn,
      },
      close: (): void => {
        this.openModelRef.close();
        this.dispatch.next({
          event: BatchOptEvent.Cancel,
        });
      },
      dismiss: () => {},
    });
  }

  onContinue(_: any) {
    this.openModelRef.close();
    this.dispatch.next({
      event: BatchOptEvent.Confirm,
      payLoad: this.payLoad,
    });
  }

  /**
   * 根据后端返回的数据，获取节点管理工程的列表
   * @param raw 后端返回数据
   * @returns 节点管理工程的列表
   */
  private getProjectNodesShipList(
    raw: ProjectNodesShipRaw
  ): ProjectNodesShip[] {
    const projNodesList: ProjectNodesShip[] = Array.from(
      toolTypeMap.keys()
    ).reduce((shipList, toolKey) => {
      const list: ProjectNodesShip[] = (raw as any)[toolKey] ?? [];
      const pureList = list.map((item) => {
        return { ...item, toolType: toolTypeMap.get(toolKey) };
      });
      return shipList.concat(pureList);
    }, []);

    return projNodesList;
  }
}
