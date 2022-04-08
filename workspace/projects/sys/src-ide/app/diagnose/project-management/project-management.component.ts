import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
  TiValidationConfig,
  TiValidators,
  TiTipDirective
} from '@cloud/tiny3';
import {
  VscodeService,
  HTTP_STATUS_CODE,
} from 'projects/sys/src-ide/app/service/vscode.service';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { CustomValidatorsService } from 'projects/sys/src-ide/app/service';
import { PageType } from './doman';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss'],
})
export class ProjectManagementComponent implements OnInit {
  public i18n: any;
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public projectInfoFormGroup: FormGroup;

  // 节点表格
  public nodeListSrcData: TiTableSrcData;
  public nodeListDisplay: Array<TiTableRowData> = [];
  public nodeListColumn: Array<TiTableColumns> = [];
  public checkedNodeListId: Array<number> = [];
  // 节点状态列表
  public nodeStatusList: any;

  // 当前用户类型
  public isAdmin = false;
  // 是否可修改该工程
  public canEdit = false;
  public type: PageType;
  public primaryBtnText: { [type in PageType]: string };
  private panelId: any;
  private projectId?: number;
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50],
    size: 10
  };
  public originTotal = 0;
  private originNodeList: Array<TiTableRowData>;
  private originAllNodeList: Array<TiTableRowData>;
  public searchKeys = ['nickName', 'nodeStatus', 'nodeIP'];
  public searchWords = ['', '', ''];
  public searchIdx: number;
  public tiSearch: TiTipDirective;
  public isSelected = false;
  public nodeNumLimit = 10;
  public allNodeIds: any = [];

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
    private vscodeService: VscodeService,
    private formBuilder: FormBuilder,
    private customValidatorsService: CustomValidatorsService
  ) {
    this.i18n = this.i18nService.I18n();
    this.initFormGroup();
    this.initNodeListTable();
  }

  private initFormGroup() {
    this.projectInfoFormGroup = this.formBuilder.group({
      projectName: new FormControl('', [
        this.customValidatorsService.projectNameValidator,
        TiValidators.required,
      ]),
    });
  }

  private initNodeListTable() {
    this.nodeListSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    };

    // 节点状态列表
    this.nodeStatusList = {
      on: { text: this.i18n.plugins_common_agentNode.online, color: '#61d274' },
      off: {
        text: this.i18n.plugins_common_agentNode.offline,
        color: '#cccccc',
      },
      init: {
        text: this.i18n.plugins_common_agentNodeManagement.adding,
        color: '#267dff',
      },
      lock: {
        text: this.i18n.plugins_common_agentNodeManagement.deleting,
        color: '#ffd610',
      },
      failed: {
        text: this.i18n.plugins_common_agentNode.failed,
        color: '#f45c5e',
      },
    };
    this.nodeListColumn = [
      { prop: 'nickName', title: this.i18n.plugins_common_agentNodeManagement.nodeName, search: true, searchIndex: 0 },
      {
        prop: 'nodeStatus', title: this.i18n.common_term_node_status,
        options: Object.keys(this.nodeStatusList).map(key => {
          const label = this.nodeStatusList[key].text;
          return { key, label };
        }),
        multiple: true,
        selected: [],
      },
      { prop: 'nodeIp', title: this.i18n.plugins_common_agentNodeManagement.nodeIP, search: true, searchIndex: 1 },
    ];
  }

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    this.type = queryParams.type;
    this.panelId = queryParams.panelId;
    this.projectId = queryParams.projectId;
    this.canEdit = JSON.parse(queryParams.canEdit || 'false');
    this.isAdmin = VscodeService.isAdmin();
    this.getNodeListData();

    this.primaryBtnText = {
      create: this.i18n.plugins_term_project_create,
      modify: this.i18n.plugins_common_term_ok,
      view: this.i18n.plugins_term_project_modify,
    };

    if (this.type !== 'create') {
      this.initProjectData();
    }
  }

  private initProjectData() {
    const optionUrl = {
      url: `/diagnostic-project/${this.projectId}/info/`
    };
    this.vscodeService.get(optionUrl, (resp: any) => {
      const params = resp.data;
      this.projectInfoFormGroup.controls.projectName.setValue(params.projectName);
      this.checkedNodeListId = params.nodeList.map((item: any) => item.id);
      if (this.type === 'view') {
        this.nodeListSrcData.data = params.nodeList;
        this.originNodeList = JSON.parse(JSON.stringify(params.nodeList));
        this.totalNumber = this.originTotal = params.nodeList.length;
      }
    });
  }

  public trackByFn(index: number, item: any) {
    return item.id;
  }

  public trimProjectName() {
    this.projectInfoFormGroup.controls.projectName.setValue(
      this.projectInfoFormGroup.value.projectName.trim()
    );
  }

  /**
   * 获取agent节点详细信息
   */
  private getNodeListData() {
    const option = {
      url: '/nodes/?analysis-type=memory_diagnostic&auto-flag=on&page=1&per-page=101',
    };
    this.vscodeService.get(option, (data: any) => {
      this.nodeListSrcData.data = data.data.nodeList;
      this.originAllNodeList = JSON.parse(JSON.stringify(data.data.nodeList));
      this.originNodeList = JSON.parse(JSON.stringify(data.data.nodeList));
      this.totalNumber = this.originTotal = data.data.nodeList.length;
      this.allNodeIds = this.originNodeList.map(item => item.id);
      this.onNodeStatusSelect(this.isSelected);
    });
  }

  public onPrimaryBtnClick() {
    switch (this.type) {
      case 'create':
        this.createProject();
        break;
      case 'modify':
        this.modifyProject();
        break;
      case 'view':
        this.switchToModifyProject();
        break;
      default: break;
    }
  }

  /**
   * 切换到修改工程
   */
  private switchToModifyProject() {
    this.type = PageType.MODIFY;
    this.nodeListSrcData.data = this.originAllNodeList;
    this.totalNumber = this.originTotal = this.originAllNodeList.length;
  }

  /**
   * 修改工程
   */
  private modifyProject() {
    const option = {
      url: '/diagnostic-project/' + this.projectId + '/',
      params: {
        projectName: this.projectInfoFormGroup.value.projectName,
        nodeList: this.checkedNodeListId,
      }
    };
    this.vscodeService.put(option, (data: any) => {
      let type = 'info';
      let info = '';
      if (HTTP_STATUS_CODE.SYSPERF_SUCCESS === data.code) {
        info = this.i18nService.I18nReplace(this.i18n.plugins_term_project_modify_success, {
          0: this.projectInfoFormGroup.value.projectName
        });
      } else {
        type = 'error';
        info = data.message;
      }
      this.vscodeService.postMessage({
        cmd: 'updateTree',
        data: {
          type,
          info
        }
      });
    });
  }

  /**
   * 创建新工程
   */
  private createProject() {
    const option = {
      url: '/memory-project/',
      params: {
        projectName: this.projectInfoFormGroup.value.projectName,
        nodeList: this.checkedNodeListId,
      },
    };
    this.vscodeService.post(option, (data: any) => {
      if (data.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
        this.vscodeService.postMessage({
          cmd: 'updateTree',
          data: {
            closePanel: this.panelId,
            type: 'info',
            info: this.i18nService.I18nReplace(this.i18n.plugins_term_project_add_success, {
              0: this.projectInfoFormGroup.value.projectName,
            }),
          },
        });
      } else {
        this.vscodeService.showInfoBox(data.message, 'error');
      }
    });
  }

  public cancel() {
    this.vscodeService.postMessage({
      cmd: 'updateTree',
      data: {
        closePanel: this.panelId,
      },
    });
  }

  /**
   * 跳转至添加节点页面
   */
  public addNode() {
    // 跳转到修改工程面板
    this.vscodeService.postMessage({
      cmd: 'navigateToPanel',
      data: {
        navigate: 'sysperfSettings',
        params: {
          innerItem: 'itemNodeManaga',
          toolType: ToolType.DIAGNOSE
        },
      },
    });
  }
  /**
   * 筛选切换
   * @param bool 是否切换选中
   */
  onNodeStatusSelect(bool: boolean, idx?: number, val?: string) {
    this.isSelected = bool;
    // 从每一行进行过滤筛选
    this.nodeListSrcData.data = this.originNodeList.filter((rowData: TiTableRowData) => {
      // 遍历所有列
      for (const columnData of this.nodeListColumn) {
        // 只有筛选列有选中项时进行筛选，如果某一筛选列选中项不包含当前行数据，则跳出循环
        if (columnData.selected && columnData.selected.length) {
          const index: number = columnData.selected.findIndex((item: any) => {
            return item.key === rowData[columnData.prop];
          });
          if (index < 0) {
            return false;
          }
        }
      }

      return true;
    });
    this.searchOut(idx, val);
    if (bool) {
      this.nodeListSrcData.data = this.nodeListSrcData.data.filter(node => {
        return this.checkedNodeListId.some(item => {
          return item === node.id;
        });
      });
      if (this.checkedNodeListId.length <= 10) {
        this.currentPage = 1;
      }
    }
    this.totalNumber = this.nodeListSrcData.data.length;
  }
  public searchClick(tiSearch: TiTipDirective, i: number) {
    this.tiSearch = tiSearch;
    const ref = tiSearch.show();
    const searchBox = ref.location.nativeElement.querySelector('input') as HTMLElement;
    searchBox.focus();
    this.searchIdx = i;
  }
  public searchOut(idx?: number, val?: string) {
    if (idx < this.searchWords.length) {
      this.searchWords[idx] = val;
    }
    this.nodeListSrcData.data = this.nodeListSrcData.data.filter((item) => {
      return this.nodeListColumn.every((column, i) => {
        let bool = false;
        if (column.search) {
          bool = item[column.prop].includes(this.searchWords[i] || '');
        } else {
          bool = true;
        }
        return bool;
      });
    });
  }
  public searchHide() {
    this.tiSearch.hide();
  }
  public clearOut(idx: number) {
    this.searchWords[idx] = '';
    this.searchOut(idx);
  }
}
