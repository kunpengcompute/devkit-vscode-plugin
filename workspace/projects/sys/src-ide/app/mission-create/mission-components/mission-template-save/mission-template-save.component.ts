import { Component, OnInit, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { VscodeService } from '../../../service/vscode.service';
import { FormControl, FormGroup, FormBuilder, } from '@angular/forms';
import { UrlService } from 'projects/sys/src-ide/app/service/diagnoseServices/url.service';
import { ToolType } from 'projects/domain';
@Component({
  selector: 'app-mission-template-save',
  templateUrl: './mission-template-save.component.html',
  styleUrls: ['./mission-template-save.component.scss']
})
export class MissionTemplateSaveComponent implements OnInit {
  @Input() data: any;
  @Input() sort: string;
  @Input() projectId: number;
  @Input() taskDetail: any;
  public i18n: any;
  // 气泡提示国际化
  public tipStr: string;
  // placeholder 国际化
  public placeholder: string;
  // 保存模板名称
  public templateName = '';
  // 各类模板的国际化
  public enMissSortArr: any;
  public ifFocus = false;
  public templateValid = '';
  // 表单验证部分
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public templateForm: FormGroup;
  public validName = false;
  public missArr: any = [
    'C/C++ Program',
    'java-mixed-mode',
    'process-thread-analysis',
    'system',
    'system_config',
    'resource_schedule',
    'system_lock',
    'mem_access'
  ];
  public validationName: TiValidationConfig = {};

  // 校验模板名称正则
  public nameReg = new RegExp(/^[a-zA-Z][a-zA-Z0-9._]{5,15}$/);
  private url: any;
  constructor(
    private urlService: UrlService,
    public i18nService: I18nService,
    public vscodeService: VscodeService,
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
    fb: FormBuilder
  ) {
    this.url = this.urlService.Url();
    this.i18n = this.i18nService.I18n();
    this.placeholder = this.i18n.mission_modal.inputTemplateName;
    this.tipStr = this.i18n.mission_modal.tipMessage;
    this.enMissSortArr = [
      this.i18n.mission_modal.cProgramAnalysis,
      this.i18n.mission_modal.javaMixedModeAnalysis,
      this.i18n.mission_modal.processAnalysis,
      this.i18n.mission_modal.sysPowerAllAnalysis,
      this.i18n.mission_modal.sysConfigAnalysis,
      this.i18n.mission_modal.resourceAnalysis,
      this.i18n.mission_modal.syslockAnalysis,
      this.i18n.mission_create.mem,
    ];
    this.templateForm = fb.group({
      templateName: new FormControl('', [TiValidators.required])
    });
  }
  public gone = true;
  public language: any;
  public toolType = sessionStorage.getItem('toolType');

  /**
   * 初始加载
   */
  ngOnInit() {
    this.language = I18nService.getLang() === 0 ? 'zh' : 'en';

    this.validationName = {
      type: 'blur',
      errorMessage: {
        regExp: this.i18n.mission_modal.templateValid,
        required: this.i18n.mission_modal.templateValid
      }
    };
    this.updateWebViewPage();
  }

  /**
   *  验证输入内容
   */
  checkItem(e) {
    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
      if (e.target.value === '') {
        e.target.style.setProperty('border-color', '#FF4C4C', 'important');
      } else {
        e.target.style.setProperty('border-color', '#5e5e5e');
      }
    }
  }

  /**
   * 关闭对话框
   */
  public close(): void {
    this.gone = !this.gone;
    this.templateName = '';
    this.ifFocus = false;
    this.templateValid = '';
    this.validName = false;
    this.updateWebViewPage();
  }

  /**
   * 开启对话框
   */
  public openModal(): void {
    this.gone = false;
    setTimeout(() => {
      for (let i = 0; i < this.missArr.length; i++) {
        if (this.data['analysis-type'] === this.missArr[i]) {
          this.sort = this.enMissSortArr[i];
          break;
        } else {
          this.sort = '';
        }
      }
    }, 0);
    this.updateWebViewPage();
  }

  /**
   *  当模板名称校验不通过时不能点击确定
   * @param e e
   */
  public validateTemplateName(e): boolean {
    if (e) {
      this.templateValid = this.i18n.mission_modal.templateValid;
    } else {
      this.templateValid = '';
    }
    if (this.nameReg.test(e)) {
      return this.validName = true;
    } else {
      return this.validName = false;
    }
  }

  /**
   * 确认保存模板
   */
  public confirm() {
    let params: any;
    if (this.toolType === ToolType.DIAGNOSE) {
      if (this.data.analysisType === 'netio_diagnostic') {
        params = {
          analysisType: 'netio_diagnostic',
          templateInfo: this.data,
          templateName: this.templateName
        };
      } else if (this.data.analysisType === 'memory_diagnostic') {
        params = {
          analysisType: 'memory_diagnostic',
          templateInfo: this.data,
          templateName: this.templateName
        };
      } else if (this.data.analysisType === 'storageio_diagnostic') {
        params = {
          analysisType: 'storageio_diagnostic',
          templateInfo: this.data,
          templateName: this.templateName
        };
      }
    } else {
      params = {
        'template-name': this.templateName,
        'template-info': this.data,
        'analysis-type': this.data['analysis-type'] || this.data.analysisType,
      };
    }
    const option: any = {
      url: `${this.url.toolTask}templates/`,
      params
    };
    if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
      option.method = 'POST';
    }
    const message = {
      cmd: 'getData',
      data: option
    };
    this.vscodeService.postMessage(message, (res: any) => {
      if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
        if (res.code === 'SysPerf.Success') {
          // 创建成功
          this.vscodeService.showTuningInfo(res.message, 'info', 'impTemplete');
        } else {
          // 创建失败
          this.vscodeService.showTuningInfo(res.message, 'error', 'impTemplete');
        }
      } else {
        // 接口调用失败，则有status返回
        if (res.status) {
          this.vscodeService.showInfoBox(res.message, 'error');
        } else if (res.code === 'SysPerf.Success') {
          this.vscodeService.showInfoBox(this.i18n.plugins_perf_tip_modelSuc, 'info');
        }
      }
      this.templateName = '';
      this.close();
    });
  }
  /**
   * intellIj刷新webview页面
   */
  public updateWebViewPage() {
    if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
      this.zone.run(() => {
        this.changeDetectorRef.detectChanges();
        this.changeDetectorRef.checkNoChanges();
      });
    }
  }
}
