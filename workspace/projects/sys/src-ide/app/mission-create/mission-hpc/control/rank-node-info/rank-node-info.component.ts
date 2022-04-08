import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
  TiValidators,
} from '@cloud/tiny3';
import { Cat } from 'hyper';
import { I18n } from 'sys/locale';

type RankNodeInfo = {
  rank: number;
  nodeIp: string;
  nickName: string;
};

@Component({
  selector: 'app-rank-node-info',
  templateUrl: './rank-node-info.component.html',
  styleUrls: ['./rank-node-info.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RankNodeInfoComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RankNodeInfoComponent),
      multi: true,
    },
  ],
})
export class RankNodeInfoComponent implements ControlValueAccessor {
  @Input()
  set rankNodes(val: RankNodeInfo[]) {
    if (null == val) {
      return;
    }
    this.srcData.data = val;
    this.setFormArray(this.formArray, val);
  }

  formArray = new FormArray([]);
  displayed: Array<TiTableRowData> = [];
  srcData: TiTableSrcData = {
    data: [] as RankNodeInfo[],
    state: {
      searched: false,
      sorted: false,
      paginated: false,
    },
  };
  columns: Array<TiTableColumns> = [
    {
      title: I18n.common_term_node_ip,
      width: '33%',
    },
    {
      title: I18n.nodeManagement.nodeName,
      width: '33%',
    },
    {
      title: I18n.hpc.mission_create.rankNum,
      width: '34%',
    },
  ];

  private propagateChange = (_: any) => {};
  private propagateTunched = (_: any) => {};

  constructor() {
    this.formArray.valueChanges.subscribe((value) => {
      this.propagateChange(value);
    });
  }

  writeValue(val: RankNodeInfo[]) {
    this.rankNodes = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl?: FormControl) {
    return this.formArray.valid;
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  private setFormArray(formArray: FormArray, rankNodes: RankNodeInfo[]) {
    if (
      Cat.isNil(rankNodes) ||
      !Cat.isArr(rankNodes) ||
      (Cat.isArr(rankNodes) && Cat.isEmpty(rankNodes))
    ) {
      return;
    }

    while (formArray.length) {
      formArray.removeAt(0);
    }
    rankNodes.forEach((node) => {
      formArray.push(this.initFormGroup(node));
    });
  }

  private initFormGroup(node?: RankNodeInfo): FormGroup {
    const nodeInfo = {
      nickName: new FormControl(node?.nickName || ''),
      nodeIp: new FormControl(node?.nodeIp || ''),
      rank: new FormControl(node?.rank || '', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(128),
      ]),
    };

    return new FormGroup(nodeInfo);
  }
}
