import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { IpProtocolType } from './../../domain';
import { IPv4NodeData } from './ip-node-data.type';
import { IpNodeInfoService } from './ip-node-info.service';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  FormArray,
  FormControl,
} from '@angular/forms';
import { HyThemeService, HyTheme } from 'hyper';
import { Observable } from 'rxjs';
import { Cat } from 'projects/hyper';

type TaskNodeOption = { label: string; value: string; disabled: boolean };
type INetIoNodeList = IPv4NodeData[];

@Component({
  selector: 'app-ipv4-node-info',
  templateUrl: './ipv4-node-info.component.html',
  styleUrls: ['./ip-node-info.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Ipv4NodeInfoComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => Ipv4NodeInfoComponent),
      multi: true,
    },
  ],
})
export class Ipv4NodeInfoComponent implements OnInit, ControlValueAccessor {
  @Input()
  set nodeList(val: INetIoNodeList) {
    if (null == val) {
      return;
    }

    this.nodeListStash = val;
    this.ipService.setFormArray(IpProtocolType.IPv4, this.formArray, val);
  }
  get nodeList(): INetIoNodeList {
    return this.nodeListStash;
  }
  @Input()
  set taskNodeList(options: { label: string; value: string }[]) {
    if (null == options || Cat.isEmpty(options)) {
      return;
    }
    this.allTaskNodeOption = options.map((option) => {
      return { ...option, disabled: false };
    });
    this.allTaskNodeOption = this.renewAllTaskNodeOptState(
      this.allTaskNodeOption,
      this.formArray.value
    );
  }

  formArray: FormArray;
  theme$: Observable<HyTheme>;
  labelWidth = '109px';
  allTaskNodeOption: TaskNodeOption[] = [];

  private nodeListStash: INetIoNodeList;
  private propagateChange = (_: any) => {};
  private propagateTunched = (_: any) => {};

  constructor(
    private ipService: IpNodeInfoService,
    private themeServe: HyThemeService
  ) {
    this.theme$ = this.themeServe.getObservable();
  }
  ngOnInit() {
    this.formArray = this.ipService.initFormArray(IpProtocolType.IPv4);
    this.formArray.valueChanges.subscribe((value) => {
      this.allTaskNodeOption = this.renewAllTaskNodeOptState(
        this.allTaskNodeOption,
        this.formArray.value
      );
      this.propagateChange(value);
    });
  }

  onFormArrayAddFG() {
    this.formArray.push(this.ipService.initFormGroup(IpProtocolType.IPv4));
  }

  onFormArrayRemoveFG(idx: number) {
    this.formArray.removeAt(idx);
  }

  writeValue(val: INetIoNodeList) {
    this.nodeList = val;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate(ctl?: FormControl) {
    return this.formArray.valid ? null : { ipv4Nodelist: { valid: false } };
  }

  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  /**
   * 更新下拉框options的状态
   * @param allTaskNodeOption options
   * @param FAValue 表单数据
   * @returns options
   */
  private renewAllTaskNodeOptState(
    allTaskNodeOption: TaskNodeOption[],
    FAValue: INetIoNodeList
  ): TaskNodeOption[] {
    return allTaskNodeOption.map((option: TaskNodeOption) => {
      const disabled = Boolean(
        FAValue.filter((item) => item.serverIp === option.value).length
      );
      return { ...option, disabled };
    });
  }
}
