import { Component, Input, OnInit, forwardRef } from '@angular/core';
import {
  FormControl,
  FormArray,
  FormGroup,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { CommonTreeNode } from 'sys/src-com/app/shared/domain';
import { HttpService } from 'sys/src-com/app/service';
import { TiValidators } from '@cloud/tiny3';
import { CustomValidatorsService } from 'sys/src-com/app/service';

import { I18n } from 'sys/locale';
@Component({
  selector: 'app-press-obj',
  templateUrl: './press-obj.component.html',
  styleUrls: ['./press-obj.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PressObjComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PressObjComponent),
      multi: true
    }
  ]
})
export class PressObjComponent implements OnInit, ControlValueAccessor {
  constructor(
    private http: HttpService,
    private validatorsServe: CustomValidatorsService
  ) {}
  @Input()
  set nodeConfig(val: any) {
    this.initFormArray(val);
    if (null == val) {
      return;
    }
  }
  @Input() projectId = +sessionStorage.getItem('projectId');
  public formArray: FormArray;
  public displayed: any[] = [];
  public tableData: any = {
    srcData: {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    },
    columnsTree: [] as Array<CommonTreeNode>,
  };
  public currentPage = 1;
  public totalNumber = 1;
  public pageSize: { options: Array<number>, size: number } = {
      options: [10, 20, 50, 100],
      size: 10
  };
  public checkedList: any = [];
  ngOnInit(): void {
    this.initTable();
  }

  private propagateChange = (_: any) => { };

  private initTable() {
    this.tableData.columnsTree = [
      {
        label: I18n.storageIo.pressObj.nodeName,
        width: '20%',
        key: 'nodeName',
      },
      {
        label: I18n.storageIo.pressObj.nodeIp,
        width: '20%',
        key: 'nodeIP'
      },
      {
        label: I18n.storageIo.pressObj.fileName,
        width: '60%',
        key: 'file_name',
        type: 'input',
        placeholder: I18n.storageIo.pressObj.placeholder,
        required: true
      }
    ];
  }

  writeValue(val: any) {
    this.nodeConfig = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate() {
    return this.formArray?.valid ? null : { nodeConfig: { valid: false } };
  }

  registerOnTouched() {
  }

  private async initFormArray(val?: any) {
    const nodeList = await this.getNodeList();
    this.formArray = null;
    nodeList.forEach((node: any) => {
      const formGroup = new FormGroup({
        file_name: new FormControl(node?.file_name || '', [
          TiValidators.required,
          this.validatorsServe.checkDriveName()
        ])
      });
      if (this.formArray) {
        this.formArray.push(formGroup);
      } else {
        this.formArray = new FormArray([formGroup]);
      }
    });
    // 填写默认值
    this.setData(nodeList, val);
    this.formArray.valueChanges.subscribe((value) => {
      const checkedIds = this.checkedList.map((item: any) => item.id);
      const srcData =
        JSON.parse(JSON.stringify(this.tableData.srcData.data.filter((item: any) => checkedIds.includes(item.id))));
      const newValue = value.map((node: any, i: number) => {
        return {
          nodeName: srcData[i]?.nodeName,
          nodeIp: srcData[i]?.nodeIP,
          nodeId: srcData[i]?.id,
          taskParam: {
            file_name: node.file_name
          }
        };
      });
      this.propagateChange(newValue);
    });
  }

  private setData(nodeList: any, val: any) {
    this.totalNumber = nodeList?.length;
    this.tableData.srcData.data = [];
    nodeList?.forEach((node: any, idx: number) => {
      let fileName = '';
      if (val) {
        fileName = val.find((item: any) => item.nodeId === node.id)?.taskParam?.file_name;
      }
      this.tableData.srcData.data.push({
        id: node.id,
        idx,
        nodeName: node.nickName,
        nodeIP: node.nodeIp,
        file_name: fileName
      });
    });
    // 默认全部置灰
    this.setDefaultDisable();
    if (val) {
      this.checkedList = [];
      this.tableData.srcData.data.forEach((node: any) => {
        if (val && val.some((item: any) => item.nodeId === node.id)) {
          this.checkedList.push(node);
        }
      });
    } else {
      this.checkedFirstRow();
    }
  }

  private checkedFirstRow() {
    const srcData = this.tableData?.srcData?.data;
    if (srcData && srcData[0]) {
      this.checkedList = [srcData[0]];
    }
  }

  public setDefaultDisable() {
    this.tableData.srcData.data.forEach((item: any) => {
      const ctl = this.formArray.controls[item.idx]?.get('file_name');
      ctl.disable();
    });
  }

  public async getNodeList() {
    const resp: any = await this.http.get(`/diagnostic-project/${this.projectId}/info/`);
    return resp?.data?.nodeList;
  }

  public onCheckedChange() {
    const checkedIds = this.checkedList.map((item: any) => item.id);
    if (checkedIds.length >= 1) {
      this.tableData?.srcData?.data?.forEach((item: any) => {
        item.disabled = false;
        const ctl = this.formArray.controls[item.idx]?.get('file_name');
        if (checkedIds.includes(item.id)) {
          if (checkedIds.length === 1) {
            item.disabled = true;
          }
          ctl.enable();
        } else {
          ctl.disable();
        }
      });
    } else {
      this.checkedFirstRow();
    }
  }
}
