import { Component, Input, SecurityContext } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from '../../../service/axios.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TiValidationConfig } from '@cloud/tiny3';
import { FormGroup, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-path-parameter',
  templateUrl: './path-parameter.component.html',
  styleUrls: ['./path-parameter.component.scss']
})
export class PathParameterComponent {
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
    public Axios: AxiosService,
    public domSanitizer: DomSanitizer,
  ) {
    this.i18n = I18n.I18n();
  }
  public i18n: any;
  public validation: TiValidationConfig = {
    type: 'blur',
  };
}
