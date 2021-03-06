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
   * ?????? --> DOM
   * @param obj ??????????????????
   */
  writeValue(val: INetIoNodeList) {
    this.nodeList = val;
  }

  /**
   * DOM --> ??????
   * ???????????????????????????????????? fn ????????????
   * ???????????????????????? emit ??????????????????
   * @param fn ????????????
   */
  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  /**
   * ??????????????????????????????????????? null ????????????????????????????????????
   * @param ctl ??????
   */
  validate(ctl: FormControl) {
    return this.formArray.valid ? null : { ipv6NodeList: { valid: false } };
  }

  /**
   * ????????????????????????????????? touched ??????
   * @param fn ????????????
   */
  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }
  /**
   * ???????????????options?????????
   * @param allTaskNodeOption options
   * @param FAValue ????????????
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
