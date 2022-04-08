import {
  Component, Input, OnInit, forwardRef,
  SecurityContext, ChangeDetectorRef
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, } from '@angular/forms';
import { AppAndParams } from '../../domain';
import { I18nService } from '../../../service/i18n.service';
import { AxiosService } from '../../../service/axios.service';
import { CustomValidatorsService } from '../../../service';
@Component({
  selector: 'app-app-params-input',
  templateUrl: './app-params-input.component.html',
  styleUrls: ['./app-params-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppParamsInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AppParamsInputComponent),
      multi: true
    }
  ],
})
export class AppParamsInputComponent implements OnInit, ControlValueAccessor {
  @Input()
  set appAndParams(val: AppAndParams) {
    if (val != null) {
      this.modeApplication = val.app;
      this.modeAppParams = val.params;
      this.missionAppChange(this.modeApplication);
    }
  }
  get appAndParams(): AppAndParams {
    return {
      app: this.modeApplication,
      params: this.modeAppParams,
    };
  }
  @Input() labelWidth: string;
  // app
  public modeApplication = '';
  // 参数
  public modeAppParams = '';
  public modeAppValid = false;

  public modeAppDisable = false;
  public modeAppParamsDisable = false;

  public isFirstFocusAppPathInput: boolean;
  public modeAppWarnMsg: string;
  public appPathInputTip: string;

  public i18n: any;
  public modeAppPathAllow = ''; // 所允许的所有应用路径，如： /opt/;/home/

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


  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    public customValidatorsService: CustomValidatorsService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    // 获取 应用路径
    this.Axios.axios.get('config/system/')
      .then(({ data }: any) => {
        this.modeAppPathAllow = data.TARGET_APP_PATH == null ? '' : data.TARGET_APP_PATH;
        this.appPathInputTip
          = this.i18n.mission_create.modeAppPathSaftWarn
          + '<br/>'
          + (this.i18n.mission_create.modeAppPathInvalid as string)
            .replace(
              '${path}',
              this.domSanitizer.sanitize(SecurityContext.HTML, this.Axios.getPathString(this.modeAppPathAllow))
            );
        this.cdr.markForCheck();
      });
  }

  /**
   * 控件 --> DOM
   * @param obj 写入的控件值
   */
  public writeValue(obj: AppAndParams) {
    if (obj != null) {
      this.modeApplication = obj.app;
      this.modeAppParams = obj.params;
      this.missionAppChange(this.modeApplication);
      this.cdr.markForCheck();
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
    return this.modeAppValid ? null : { appAndParams: { valid: false } };
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
   */
  public setDisabledState(isDisabled: boolean) {
    this.modeAppDisable = isDisabled;
    this.modeAppParamsDisable = isDisabled;
    this.cdr.markForCheck();
  }

  // 应用路径校验(输入时)
  public missionAppChange(e: any): any {
    this.isFirstFocusAppPathInput = false;

    e = this.modeApplication ? this.modeApplication.toString().trim() : ''; // 去掉字符串的头尾空格

    // 验证一：为空判断
    if (this.modeApplication == null || this.modeApplication.trim() === '') {
      this.modeAppWarnMsg = this.i18n.mission_create.modeAppPath;
      this.modeAppValid = false;
      this.propagateChange(this.appAndParams);
      this.cdr.markForCheck();
      return;
    }

    // 判断二：正则验证
    // 匹配规则简述：1、前必有 /; 2、不含字符：^ ` | ; & $ > < \ ! 任何空白字符; 4、不能以 / 结尾; 3、不能出现：//
    const regOne = this.customValidatorsService.applicationPathReg;
    const regTwo = /(\/{2,})/;
    if (this.customValidatorsService.pathMatch(e)) {
      this.modeAppWarnMsg = this.i18n.mission_create.modeAppWarn;
      this.modeAppValid = false;
      this.propagateChange(this.appAndParams);
      this.cdr.markForCheck();
      return;
    }

    // 验证三：是否为系统配置指定路径下应用判断
    let isIncluded = false;
    const allowPathList: string[] = this.modeAppPathAllow.split(';');
    for (const allowPath of allowPathList) {
      if (this.modeApplication.includes(allowPath) && this.modeApplication.indexOf(allowPath) === 0) {
        isIncluded = true;
      }
    }
    if (!isIncluded) {
      this.modeAppWarnMsg = (this.i18n.mission_create.modeAppPathInvalid as string).replace('${path}',
        this.Axios.getPathString(this.modeAppPathAllow));
      this.modeAppValid = false;
      this.propagateChange(this.appAndParams);
      this.cdr.markForCheck();
      return;
    }

    // 验证通过
    this.modeApplication = e;
    this.modeAppWarnMsg = '';
    this.modeAppValid = true;
    this.propagateChange(this.appAndParams);
    this.cdr.markForCheck();
  }

  public onAppParamChange(val: string) {
    this.modeAppParams = val;
    this.propagateChange(this.appAndParams);
    this.cdr.markForCheck();
  }
}
