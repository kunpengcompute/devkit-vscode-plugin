import { Component, OnInit, Input, ViewChild, Output, EventEmitter, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { I18nService } from '../../../../service/i18n.service';
import { AxiosService } from '../../../../service/axios.service';
import { CustomValidatorsService } from '../../../../service';

interface AppNodeConfigData {
  nodeName: string;
  nodeIP: string;
  rawData: any;
  param: {
    status: boolean;
    'app-dir': string;
    'app-parameters': string;
  };
  runUserDate: {
    runUser: boolean;
    user: string;
    password: string;
  };
  isModifySchedule: boolean;
}

@Component({
  selector: 'app-process-node-config-app',
  templateUrl: './process-node-config-app.component.html',
  styleUrls: ['./process-node-config-app.component.scss']
})
export class ProcessNodeConfigAppComponent implements OnInit {
  @ViewChild('missionPublic') missionPublic: any;

  @Input()
  set configData(val: AppNodeConfigData) {
    this.nodeName = val.nodeName;
    this.nodeIP = val.nodeIP;
    this.rawData = val.rawData;
    this.modeApplication = val.param['app-dir'];
    this.modeAppParams = val.param['app-parameters'];
    this.switchState = val.runUserDate.runUser;
    this.modeApplicationUser = val.runUserDate.user;
    this.modeApplicationPassWord = val.runUserDate.password;
    this.isModifySchedule = val.isModifySchedule;
  }
  @Output() confirmConfig = new EventEmitter<AppNodeConfigData>();
  @Input() labelWidth = '200px';
  @Input() drawerLevel: number;

  public nodeName = '';
  public nodeIP = '';
  public modeApplication = '';
  public modeAppParams = '';
  public rawData: any;

  public modeAppValid = true;
  public isFirstFocusAppPathInput: boolean;
  public modeAppWarnMsg: string;
  public appPathInputTip: string;

  public i18n: any;
  public modeAppPathAllow = ''; // 所允许的所有应用路径，如： /opt/;/home/

  private ieFocusCountAppPid = 0;
  public switchState = false;
  public modeApplicationUser = '';  // 用户名
  public modeAppRunUserValid = true; // 应用运行用户必选校验
  public runUserValid = true;
  public runPasswordValid = true;
  public modeApplicationPassWord = '';
  public isModifySchedule: boolean;
  public runUserDate: {
    runUser: boolean,
    user: string,
    password: string,
  };
  public runUserMsg: string;

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    private domSanitizer: DomSanitizer,
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
          + (this.i18n.mission_create.modeAppPathInvalid as string).replace(
            '${path}',
            this.domSanitizer.sanitize(SecurityContext.HTML, this.Axios.getPathString(this.modeAppPathAllow))
          );
      });
  }

  // 确认
  public confirm() {
    this.confirmConfig.emit({
      nodeName: this.nodeName,
      nodeIP: this.nodeIP,
      rawData: this.rawData,
      param: {
        status: true,
        'app-dir': this.modeApplication,
        'app-parameters': this.modeAppParams,
      },
      runUserDate: {
        runUser: this.switchState,
        user: this.modeApplicationUser,
        password: this.modeApplicationPassWord
      },
      isModifySchedule: this.isModifySchedule
    });
    this.missionPublic.close();
  }

  // 打开
  public open() {
    this.missionPublic.open();
  }

  public close() {
    this.switchState = false;
    // 关闭之前将用户名和密码的警告文字隐藏
    this.runUserValid = true;
    this.runPasswordValid = true;
    // 关闭之前将确认的禁用去掉
    this.modeAppRunUserValid = true;
    this.missionPublic.close();
  }

  // 应用路径校验(输入时)
  public missionAppChange(e: any): any {
    this.isFirstFocusAppPathInput = false;

    const userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
    const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1;
    if (isIE11) {
      this.ieFocusCountAppPid++;
      if (this.ieFocusCountAppPid < 3) {
        return;
      }
    }
    e = this.modeApplication ? this.modeApplication.toString().trim() : ''; // 去掉字符串的头尾空格

    // 验证一：为空判断
    if (this.modeApplication == null || this.modeApplication.trim() === '') {
      this.modeAppWarnMsg = this.i18n.mission_create.modeAppPath;
      this.modeAppValid = false;
      return;
    }

    // 判断二：正则验证
    // 匹配规则简述：1、前必有 /; 2、不含字符：^ ` | ; & $ > < \ ! 任何空白字符; 4、不能以 / 结尾; 3、不能出现：//
    const regOne = this.customValidatorsService.applicationPathReg;
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
      if (this.modeApplication.includes(allowPath) && this.modeApplication.indexOf(allowPath) === 0) {
        isIncluded = true;
      }
    }
    if (!isIncluded) {
      this.modeAppWarnMsg = (this.i18n.mission_create.modeAppPathInvalid as string).replace('${path}',
        this.Axios.getPathString(this.modeAppPathAllow));
      this.modeAppValid = false;
      return;
    }

    // 验证通过
    this.modeApplication = e;
    this.modeAppWarnMsg = '';
    this.modeAppValid = true;
  }

  public onAppParamChange(val: string) {
  }
  public onSwitchChange(e: any) {
    this.switchState = e;
  }

  public checkUserOrPassWord(str: string) {
    if (str === 'user') {
      this.runUserValid = Boolean(this.modeApplicationUser);
      if (this.modeApplicationUser === '') {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_empty_judge;
        this.runUserValid = false;
        this.modeAppRunUserValid = false;
        return;
      }
      const reg = new RegExp('^[a-zA-Z._][a-zA-Z0-9._\\-]{0,127}$');
      if (!reg.test(this.modeApplicationUser)) {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_run_user_msg;
        this.runUserValid = false;
      } else {
        this.runUserValid = true;
      }
    } else if (str === 'password') {
      this.runPasswordValid = Boolean(this.modeApplicationPassWord);
    }
    // 验证必选项
    if (this.switchState) {
      this.modeAppRunUserValid = Boolean(this.modeApplicationUser) && Boolean(this.modeApplicationPassWord);
    } else {
      this.modeAppRunUserValid = true;
    }
  }
}
