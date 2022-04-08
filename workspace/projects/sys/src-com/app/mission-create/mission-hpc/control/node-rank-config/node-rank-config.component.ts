import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { TiTableRowData, TiTableSrcData, TiValidators } from '@cloud/tiny3';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { I18n } from 'sys/locale';
import { NodeRankInfo, RankSetControl } from '../../domain';

@Component({
  selector: 'app-node-rank-config',
  templateUrl: './node-rank-config.component.html',
  styleUrls: ['./node-rank-config.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NodeRankConfigComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NodeRankConfigComponent),
      multi: true,
    },
  ],
})
export class NodeRankConfigComponent implements OnInit, ControlValueAccessor {
  @Input()
  set rankNodeList(val: NodeRankInfo[]) {
    if (null == val) {
      return;
    }
    this.nodeTableData = this.initNodeTableData(val);
    this.setFormGroup(val);
  }

  columns = this.getColums();

  formGroup: FormGroup;

  displayed: Array<TiTableRowData> = [];
  srcData: TiTableSrcData;
  currentPage = 1;
  totalNumber: number;
  pageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 50, 100],
    size: 10,
  };
  nodeTableData: CommonTableData;

  private actionRankSet: RankSetControl['action'];
  private propagateChange = (_: NodeRankInfo[]) => {};
  private propagateTunched = (_: any) => {};

  constructor() {
    this.formGroup = new FormGroup({});
    this.formGroup.valueChanges.subscribe((val: any) => {
      const data = JSON.parse(JSON.stringify(this.nodeTableData.srcData.data));
      const rankNodeList = data.map((item: any, index: number) => {
        const key = Object.keys(val)[index];
        item.rank = val[key];
        return item;
      });
      this.propagateChange(rankNodeList);
    });
  }

  ngOnInit(): void {}

  writeValue(val: any[]) {
    this.rankNodeList = val;
  }
  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl: FormControl) {
    return this.nodeTableData.srcData.data.length
      ? null
      : { nodeRankConfig: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  // 更新rank数量到表格
  onUpdateList(updataList: NodeRankInfo[]) {
    updataList.forEach((item: NodeRankInfo) => {
      this.formGroup.get('rank' + item.id).setValue(item.rank);
    });
    this.nodeTableData.srcData.data = updataList;
    this.nodeTableData = { ...this.nodeTableData };
  }

  // 点击rank节点数量按钮打开弹窗
  onOpenConfigRankModel() {
    this.actionRankSet(this.nodeTableData.srcData.data as NodeRankInfo[]);
  }

  onRankSetInited(evt: RankSetControl) {
    const { action } = evt;
    this.actionRankSet = action;
  }
  private initNodeTableData(rankNodeList: NodeRankInfo[]): CommonTableData {
    return {
      srcData: {
        data: rankNodeList,
        state: {
          searched: false,
          sorted: false,
          paginated: false,
        },
      } as TiTableSrcData,
      columnsTree: this.columns,
    };
  }
  private setFormGroup(rankNodeList: NodeRankInfo[]) {
    rankNodeList.forEach((nodeItem: any) => {
      this.formGroup.addControl(
        'rank' + nodeItem.id,
        new FormControl(nodeItem.rank, [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(128),
        ])
      );
    });
  }

  private getColums() {
    return [
      {
        key: 'nodeIp',
        label: I18n.common_term_node_ip,
        width: '33%',
        checked: true,
        searchKey: 'nodeIp',
        canClick: true,
      },
      {
        key: 'nickName',
        label: I18n.nodeManagement.nodeName,
        width: '33%',
        checked: true,
        searchKey: 'nickName',
      },
      {
        key: 'rank',
        label: I18n.hpc.mission_create.rankNum,
        width: '34%',
        checked: true,
      },
    ];
  }
}
