import { Component, OnInit, Input } from '@angular/core';
import { TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ToolType } from 'projects/domain';
import { HttpService, I18nService, TipService, UrlService } from 'sys/src-com/app/service';
import { HyThemeService, HyTheme } from 'hyper';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mission-template-save',
  templateUrl: './mission-template-save.component.html',
  styleUrls: ['./mission-template-save.component.scss']
})
export class MissionTemplateSaveComponent implements OnInit {
  @Input() data: any;
  @Input() type: string;
  @Input() sort: string;
  public url: any;
  public i18n: any;
  public theme$: Observable<HyTheme>;
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
  public missArr: any = ['C/C++ Program', 'java-mixed-mode', 'process-thread-analysis', 'system',
    'system_config', 'resource_schedule', 'system_lock', 'mem_access'];
  public validationName: TiValidationConfig = {};
  // 校验模板名称正则
  public nameReg = new RegExp(/^[a-zA-Z][a-zA-Z0-9._]{5,15}$/);
  constructor(
    public i18nService: I18nService,
    private http: HttpService,
    private fb: FormBuilder,
    private mytip: TipService,
    private urlService: UrlService,
    private themeServe: HyThemeService
  ) {
    this.theme$ = this.themeServe.getObservable();
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
      this.i18n.mission_modal.memAccessAnalysis,
    ];
    this.templateForm = this.fb.group({
      templateName: new FormControl('', [TiValidators.required])
    });
  }
  public gone = true;
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  ngOnInit() {
    this.validationName = {
      type: 'blur',
      errorMessage: {
        regExp: this.i18n.mission_modal.templateValid,
        required: this.i18n.mission_modal.templateValid
      }
    };
  }
  // 关闭对话框
  public close(): void {
    this.gone = !this.gone;
    this.templateName = '';
    this.ifFocus = false;
    this.templateValid = '';
  }
  // 开启对话框
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
  }

  // 当模板名称校验不通过时不能点击确定（未完成）
  public validateTemplateName(e: any): boolean {
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
  public confirm(): void {
    // 接收父组件传值，拼接params对象，调用接口
    // TODO
    // 模板名称templateName 校验非法字符，前后空格
    let params: any;
    // 诊断调试
    if (this.isDiagnose) {
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
    this.http.post(`${this.url.toolTask}templates/`, params).then((res: any) => {
      this.mytip.alertInfo({ type: 'success', content: this.i18n.mission_modal.successKeepTemplate, time: 3500 });
      this.close();
      this.templateName = '';
    });
  }
}
