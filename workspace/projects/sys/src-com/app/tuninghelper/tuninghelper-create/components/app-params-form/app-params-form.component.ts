import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { HttpService, I18nService, CustomValidatorsService } from 'sys/src-com/app/service';

interface AppParams {
  appParam: {
    appDir: string;
    appParameters?: string;
  };
  switch?: boolean;
  runUserParam?: {
    user_name: string;
    password: any;
  };
}
@Component({
  selector: 'app-app-params-form',
  templateUrl: './app-params-form.component.html',
  styleUrls: ['./app-params-form.component.scss']
})
export class AppParamsFormComponent implements OnInit, AfterViewInit {
  /** 表单校验状态 */
  @Output() checkAppParamVaild = new EventEmitter<any>();
  @Output() getAppParamChange = new EventEmitter<any>();
  /** label 宽度 */
  @Input() labelWidth: string;
  /** 输入框 宽度 */
  @Input() inputWidth: string;
  /** tip 宽度 */
  @Input() tipWidth: string;
  /** 入参 */
  @Input() appParamsInfos: AppParams;
  public i18n: any;
  constructor(
    public i18nService: I18nService,
    public http: HttpService,
    public customValidatorsService: CustomValidatorsService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public appParamsFormGroup: FormGroup;
  public userFormGroup: FormGroup;
  public modeAppPathAllow = '';
  public appPathPlaceholder = '';
  public appPathTip = '';
  public runUserSwitch = false;
  public appParamValid: string;
  public userParamValid: string;
  public appParamsInfo: AppParams;
  ngOnInit(): void {
    this.getAppDir();
    this.appParamsFormGroup = new FormGroup({
      appPath: new FormControl('', [this.customValidatorsService.checkEmpty(this.i18n.mission_create.modeAppPath),
      this.customValidatorsService.pathValidator(), this.appDirValidator(),
      TiValidators.required]),
      appParams: new FormControl('', []),
      appUserSwitch: new FormControl(false, []),
    });
    this.userFormGroup = new FormGroup({
      userName: new FormControl('', [this.customValidatorsService.checkEmpty(),
      this.customValidatorsService.runUserNameValidator(), TiValidators.required]),
      password: new FormControl('', [this.customValidatorsService.checkEmpty(), TiValidators.required]),
    });
    this.appParamsFormGroup.statusChanges.subscribe(status => {
      this.appParamValid = status;
      this.getValidStatus();
    });
    this.userFormGroup.statusChanges.subscribe(status => {
      this.userParamValid = status;
      this.getValidStatus();
    });
  }

  ngAfterViewInit(): void {
    if (!this.appParamsInfos) { return; }
    setTimeout(() => {
      this.initParams();
    }, 0);
  }
  /**
   * 获取表单校验状态 传给父组件
   */
  public getValidStatus() {
    // 组件实时状态值
    this.appParamsInfo = {
      appParam: {
        appDir: this.appParamsFormGroup.get('appPath').value || '',
        appParameters: this.appParamsFormGroup.get('appParams').value || '',
      },
      switch: this.appParamsFormGroup.get('appUserSwitch').value,
      runUserParam: {
        user_name: this.userFormGroup.get('userName').value || '',
        password: this.userFormGroup.get('password').value || '',
      }
    };
    let status;
    if (!this.runUserSwitch) {
      status = this.appParamValid;
    } else {
      status = this.appParamValid === 'VALID' && this.userParamValid === 'VALID' ? 'VALID' : 'INVALID';
    }
    this.getAppParamChange.emit(this.appParamsInfo);
    this.checkAppParamVaild.emit(status);
  }

  /**
   * 校验应用路径
   */
  public appDirValidator(): any {
    return (control: AbstractControl): ValidationErrors | null => {
      let isIncluded = false;
      const allowPathList: string[] = this.modeAppPathAllow.split(';');
      for (const allowPath of allowPathList) {
        if (control.value.includes(allowPath) && control.value.indexOf(allowPath) === 0) {
          isIncluded = true;
        }
      }
      if (!isIncluded) {
        const modeAppWarnMsg = (this.i18n.mission_create.modeAppPathInvalid as string)
          .replace('${path}', this.getPathString(this.modeAppPathAllow));
        return { appPathValid: { tiErrorMessage: modeAppWarnMsg } };
      } else {
        return null;
      }
    };
  }

  /**
   * 获取应用程序路径配置
   */
  public getAppDir() {
    this.http.get('/config/system/').then((data: any) => {
      this.modeAppPathAllow = data.data.TARGET_APP_PATH === null ? '' : data.data.TARGET_APP_PATH;
      this.appPathTip =
        (this.i18n.mission_create.modeAppPathInvalid as string).replace(
          '${path}',
          this.getPathString(this.modeAppPathAllow)
        );
      this.appPathPlaceholder =
        (this.i18n.mission_create.modeAppHolder as string).replace(
          '${path}',
          this.getPathString(this.modeAppPathAllow)
        );
    });
  }

  /**
   * 分割应用路径显示
   * @param str 应用程序路径配置
   */
  public getPathString(str: any) {
    const lang = sessionStorage.getItem('language');
    let pathString = '';
    if (lang === 'zh-cn') {
      pathString = str.replace(/;/g, '或');
    } else {
      pathString = str.replace(/;/g, ' or ');
    }
    return pathString;
  }

  /**
   * 打开配置指定节点弹框，禁用相关界面参数
   * @param isDisabled 是否需禁用
   */
  public disableChange(isDisabled: boolean) {
    if (isDisabled) {
      this.appParamsFormGroup.controls.appPath.disable({ emitEvent: false });
      this.appParamsFormGroup.controls.appParams.disable({ emitEvent: false });
      this.appParamsFormGroup.controls.appUserSwitch.disable({ emitEvent: false });
      this.userFormGroup.controls.userName.disable({ emitEvent: false });
      this.userFormGroup.controls.password.disable({ emitEvent: false });
    } else {
      this.appParamsFormGroup.controls.appPath.enable({ emitEvent: false });
      this.appParamsFormGroup.controls.appParams.enable({ emitEvent: false });
      this.appParamsFormGroup.controls.appUserSwitch.enable({ emitEvent: false });
      this.userFormGroup.controls.userName.enable({ emitEvent: false });
      this.userFormGroup.controls.password.enable({ emitEvent: false });
    }
  }

  /**
   * @param e 应用运行用户开关状态
   */
  public runUserparamChange(e: boolean) {
    this.getValidStatus();
    if (!e) {
      this.userFormGroup.reset();
    }
  }

  /**
   * 初始化指定节点参数
   */
  public initParams() {
    this.appParamsFormGroup.controls.appParams.setValue(this.appParamsInfos.appParam?.appParameters);
    this.appParamsFormGroup.controls.appPath.setValue(this.appParamsInfos.appParam?.appDir);
    this.appParamsFormGroup.controls.appUserSwitch.setValue(this.appParamsInfos.switch);
    this.userFormGroup.controls.userName.setValue(this.appParamsInfos.runUserParam?.user_name);
    this.userFormGroup.controls.password.setValue(this.appParamsInfos.runUserParam?.password);
  }
}
