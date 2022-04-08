import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { I18nService } from './../../../service/i18n.service';
import { VscodeService } from './../../../service/vscode.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomValidatorsService } from 'sys/src-com/app/service/index';

@Component({
  selector: 'app-path-parameter',
  templateUrl: './path-parameter.component.html',
  styleUrls: ['./path-parameter.component.scss']
})
export class PathParameterComponent implements OnInit {
  @Input() displayedElementList: any[];
  @Input() allFormElements: any;
  @Input() formGroup: any;
  @Input() labelWidth = '190px';
  @Input() from: string;  // template 表示是查看模板信息，添加对应的css
  @Input() widthIsLimited = false;  // 表单父容器的宽度是否受限，例如在 home 界面提示信息在输入框的后面显示，在修改预约任务的drawer里面提示信息需要在输入框的下面显示
  @Input() analysisMode: any;
  @Input() analysisType: any;

  constructor(
    public I18n: I18nService,
    public vscodeService: VscodeService,
    public domSanitizer: DomSanitizer,
    private customValidatorsService: CustomValidatorsService
  ) {
    this.i18n = I18n.I18n();
  }
  public i18n: any;
  public modeAppPathAllow = ''; // 所允许的所有应用路径，如： /opt/;/home/

  // 应用路径
  public modeApplication: string;
  // 应用路径警告
  public modeAppValid = true;
  public modeAppWarnMsg: string;
  public isFirstFocusAppPathInput: boolean;
  public appPathInputTip: any;

  // 应用参数
  public modeAppParams: string;

  isShowUserAndPassword = false;
  public passwordInputType = 'password';

  // 用户名校验
  public runUserValid = true;
  public runUserMsg: string;

  // 密码校验
  public runPasswordValid = true;
  public modeAppRunUserValid = true;


  ngOnInit(): void {
    const options = {
      url: '/config/system/'
    };
    this.vscodeService.get(options, (res: any) => {
      this.modeAppPathAllow = res.data.TARGET_APP_PATH == null ? '' : res.data.TARGET_APP_PATH;
      this.appPathInputTip
        = this.i18n.mission_create.modeAppPathSaftWarn
        + '<br/>'
        + (this.i18n.mission_create.modeAppPathInvalid as string)
          .replace(
            '${path}',
            this.domSanitizer.sanitize(SecurityContext.HTML, this.vscodeService.getPathString(this.modeAppPathAllow))
          );
    });
  }
  // 应用路径校验(输入时)
  public missionAppChange(e: any) {
    this.isFirstFocusAppPathInput = false;

    if (e == null) {
      return;
    }

    e = e?.trim();

    // 验证一：为空判断
    if (e == null || e.trim() === '') {
      this.modeAppWarnMsg = this.i18n.mission_create.modeAppPath;
      this.modeAppValid = false;
      return;
    }

    // 判断二：正则验证
    // 匹配规则简述：1、前必有 /; 2、不含字符：^ ` | ; & $ > < \ ! 任何空白字符; 4、不能以 / 结尾; 3、不能出现：//
    const regOne = /^\/([^`\|;&$><\\!\s])+[^\/]$/;
    const regTwo = /(\/{2,})/;
    if (this.customValidatorsService.pathMatch(e)) {
      this.modeAppWarnMsg = this.i18n.mission_create.modeAppWarn;
      this.modeAppValid = false;
      return;
    }

    // 验证三：是否为系统配置指定路径下应用判断
    let isIncluded = false;
    const allowPathList: string[] = this.modeAppPathAllow.split(';');
    for (const allowPath of allowPathList) {
      if (e.includes(allowPath) && e.indexOf(allowPath) === 0) {
        isIncluded = true;
      }
    }
    if (!isIncluded) {
      this.modeAppWarnMsg = (this.i18n.mission_create.modeAppPathInvalid as string).replace('${path}',
        this.vscodeService.getPathString(this.modeAppPathAllow));
      this.modeAppValid = false;
      return;
    }

    // 验证通过
    this.modeAppWarnMsg = '';
    this.modeAppValid = true;
  }
  public checkUserOrPassWord(event: boolean | string, str: string) {
    if (str === 'switch') {
      this.isShowUserAndPassword = event as boolean;
      if (!event) {
        this.formGroup.controls.user_name.setValue('');
        this.formGroup.controls.password.setValue('');
      }
    } else if (str === 'user') {
      this.runUserValid = Boolean(event);
      if (event === '') {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_empty_judge;
        this.runUserValid = false;
        return;
      }
      const reg = new RegExp('^[a-zA-Z._][a-zA-Z0-9._\\-]{0,127}$');
      if (!reg.test(event as string)) {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_run_user_msg;
        this.runUserValid = false;
      } else {
        this.runUserValid = true;
      }
    } else if (str === 'password') {
      this.runPasswordValid = Boolean(event);
    }
    // 验证必选项
    if (this.formGroup.controls.switchState.value) {
      this.modeAppRunUserValid = Boolean(this.formGroup.controls.user_name.value)
        && Boolean(this.formGroup.controls.password.value);
    } else {
      this.modeAppRunUserValid = true;
    }
  }
}
