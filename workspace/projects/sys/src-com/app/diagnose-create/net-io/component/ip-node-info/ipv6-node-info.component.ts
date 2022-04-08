import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { IpProtocolType } from './../../domain';
import { IPv6NodeData } from './ip-node-data.type';
import { IpNodeInfoService } from './ip-node-info.service';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  FormArray,
  FormControl,
} from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';
import { HyThemeService, HyTheme } from 'hyper';
import { Observable } from 'rxjs';
import { Cat } from 'projects/hyper';

type TaskNodeOption = { label: string; value: string; disabled: boolean };
type INetIoNodeList = IPv6NodeData[];

@Component({
  selector: 'app-ipv6-node-info',
  templateUrl: './ipv6-node-info.component.html',
  styleUrls: ['./ip-node-info.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Ipv6NodeInfoComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => Ipv6NodeInfoComponent),
      multi: true,
    },
  ],
})
export class Ipv6NodeInfoComponent implements OnInit, ControlValueAccessor {
  @Input()
  set nodeList(val: INetIoNodeList) {
    this.nodeListStash = val;
    this.ipService.setFormArray(IpProtocolType.IPv6, this.formArray, val);
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
  validation: TiValidationConfig = {
    type: 'blur',
  };
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
    this.formArray = this.ipService.initFormArray(IpProtocolType.IPv6);

    this.formArray.valueChanges.subscribe((value) => {
      this.allTaskNodeOption = this.renewAllTaskNodeOptState(
        this.allTaskNodeOption,
        this.formArray.value
      );
      this.propagateChange(value);
    });
  }

  onFormArrayAddFG() {
    this.formArray.push(this.ipService.initFormGroup(IpProtocolType.IPv6));
  }

  onFormArrayRemoveFG(idx: number) {
    this.formArray.removeAt(idx);
  }

  /**
   * 控件 --> DOM
   * @param obj 写入的控件值
   */
  writeValue(val: INetIoNodeList) {
    this.nodeList = val;
  }

  /**
   * DOM --> 控件
   * 当表单控件值改变时，函数 fn 会被调用
   * 这也是我们把变化 emit 回表单的机制
   * @param fn 通知回调
   */
  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  /**
   * 验证表单，验证结果正确返回 null 否则返回一个验证结果对象
   * @param ctl 控件
   */
  validate(ctl: FormControl) {
    return this.formArray.valid ? null : { ipv6NodeList: { valid: false } };
  }

  /**
   * 这里没有使用，用于注册 touched 状态
   * @param fn 通知回调
   */
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
  ) {
    return allTaskNodeOption.map((option: TaskNodeOption) => {
      const disabled = Boolean(
        FAValue.filter((item) => item.serverIp === option.value).length
      );
      return { ...option, disabled };
    });
  }
}
