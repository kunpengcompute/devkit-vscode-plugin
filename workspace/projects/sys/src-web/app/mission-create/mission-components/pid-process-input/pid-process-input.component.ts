import { Component, EventEmitter, Input, Output, forwardRef, OnInit, } from '@angular/core';
import {
  FormControl, FormGroup, AbstractControl,
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS,
} from '@angular/forms';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import { PidProcessControls } from './pid-process-controls';
import { PidProcessDisableUtil } from './pid-process-disable.util';
import { PidProcess } from '../../domain';
import { CustomValidatorsService } from 'sys/src-com/app/service';
import { ATTACH_PROCESS_PID_NUM_MAX } from 'sys/src-com/app/global/constant';

/**
 * 本组件的为表单控件，请按表单控件的规范使用和修改！
 *
 * @description 本表单控件主要目的是控制 pid 和 程序名称 输入控件之间的交互逻辑。
 *
 * @input pinProcess 初始的pid值 和 初始的程序名称值
 * @output inputChange 当输入值变更时的 emit 事件，泛型类为 PidProcess
 *
 * @usageNotes 本控件使用广泛，如果修改者不具备封装表单控件的相关知识，请谨慎修改！
 */
@Component({
  selector: 'app-pid-process-input',
  templateUrl: './pid-process-input.component.html',
  styleUrls: ['./pid-process-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PidProcessInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PidProcessInputComponent),
      multi: true
    }
  ],
})
export class PidProcessInputComponent implements ControlValueAccessor, OnInit {
  /** label 宽度 */
  @Input() labelWidth: string;
  /** 输入框 宽度 */
  @Input() inputWidth = '388px';
  /** 入参: pid 和 process 的值 */
  @Input() pinProcess: PidProcess;
  /** 至多可输入pid的数量 */
  @Input() atMostPid = ATTACH_PROCESS_PID_NUM_MAX;
  /** emit: 当值发生时 */
  @Output() inputChange = new EventEmitter<PidProcess>();
  @Output() checkProcessPid = new EventEmitter<string>();

  /** 使用TiValidation定义接口类型 */
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  /** 表单控件组 */
  public ppFormGroup: FormGroup;
  /** 表单控件字典 */
  public ctl: { [key: string]: AbstractControl; };
  // 其他
  public i18n: any;
  public readonly attachProcessPidNumMax = ATTACH_PROCESS_PID_NUM_MAX;
  /** 上一次的disabled 状态 */
  private prevIsDisabled: boolean;
  /** 组件以前的 disable 状态 */
  private prevDisabledState: {
    processCheckDisable: boolean,
    processInputDisable: boolean,
    pidCheckDisable: boolean,
    pidInputDisable: boolean,
  };

  private controlsService: PidProcessControls;
  /**
   * 这里是做一个空函数体，真正使用的方法在 registerOnChange 中
   * 由框架注册，然后我们使用它把变化发回表单
   */
  private propagateChange = (_: any) => { };
  /**
   * 这里是做一个空函数体，真正使用的方法在 registerOnTouched 中
   * 由框架注册，然后我们使用它把变化发回表单
   */
  private propagateTunched = (_: any) => { };

  /**
   * 创建表单控件组，并初始化部分控件的状态和它们的交互逻辑
   * @param fb FormBuilder
   * @param controlsService 本组件的服务类
   */
  constructor(
    private i18nService: I18nService,
    private customValidatorsService: CustomValidatorsService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.controlsService = new PidProcessControls(this.atMostPid ?? ATTACH_PROCESS_PID_NUM_MAX);

    // 新建控件组
    this.ppFormGroup = new FormGroup({
      processCheck: new FormControl(true),
      processInput: new FormControl(undefined, [
        this.customValidatorsService.processNameValidator, TiValidators.required
      ]),
      pidCheck: new FormControl(false),
      pidInput: new FormControl(undefined, [TiValidators.required, this.controlsService.pidInputValidator(this.i18n)]),
    }, {
      updateOn: 'change',
    });
    this.ctl = this.ppFormGroup.controls;

    // 初始化控件状态
    this.ctl.processCheck.disable();
    this.ctl.pidInput.disable();

    // 初始化控件交互
    this.controlsService.initControlsInteraction(this.ppFormGroup);

    // 订阅表单 状态变更
    this.ppFormGroup.statusChanges.subscribe(status => {
      this.checkProcessPid.emit(status);
    });
    // 订阅控件组的值变更主题
    this.ppFormGroup.valueChanges.subscribe(() => {
      const rawValue = this.ppFormGroup.value;
      const reliable = {
        pid: rawValue.pidInput == null
          ? void 0
          : this.controlsService.splitStr(rawValue.pidInput).join(','),
        process: rawValue.processInput,
      };
      this.inputChange.emit(reliable);
      this.propagateChange(reliable);
    });
  }

  /**
   * 控件 --> DOM
   * @param obj 写入的控件值
   */
  public writeValue(obj: PidProcess) {
    if ((obj != null) && (typeof obj === 'object')) {
      this.controlsService.setControlsByWrite(this.ppFormGroup, obj);
      this.ctl.processInput.reset(obj.process);
      this.ctl.pidInput.reset(obj.pid);
    }
  }

  /**
   * DOM --> 控件
   * 当表单控件值改变时，函数 fn 会被调用
   * 这也是我们把变化 emit 回表单的机制
   * @param fn 通知回调
   */
  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  /**
   * 验证表单，验证结果正确返回 null 否则返回一个验证结果对象
   * @param ctl 控件
   */
  public validate(ctl: FormControl) {
    return this.ppFormGroup.valid ? null : { pidProcess: { valid: false } };
  }

  /**
   * 这里没有使用，用于注册 touched 状态
   * @param fn 通知回调
   */
  public registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  /**
   * 使能 与 失能的状态设置
   * @param isDisabled 状态标志
   * @usageNote 当设置状态的操作发生在设置值的操作之后，
   */
  public setDisabledState(isDisabled: boolean) {
    if (this.prevIsDisabled == null || this.prevIsDisabled !== isDisabled) {
      setTimeout(() => {
        this.prevDisabledState = PidProcessDisableUtil.handleControlsDisableState(
          this.ppFormGroup, isDisabled, this.prevDisabledState
        );
        this.prevIsDisabled = isDisabled;
      });
    }
  }

  /**
   * 选择框状态改变时 重置表单校验
   * @param model 选择框是否选中
   * @param type 选择类型
   */
  public onNgModelChange(model: boolean, type: string) {
    if (!model) {
      type === 'processCheck' ? this.ctl.processInput.reset('') : this.ctl.pidInput.reset('');
    }
  }
}
