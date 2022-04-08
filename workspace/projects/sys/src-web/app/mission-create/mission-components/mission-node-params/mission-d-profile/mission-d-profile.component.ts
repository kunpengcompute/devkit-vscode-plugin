import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { TiValidationConfig, TiValidators } from '@cloud/tiny3';

@Component({
  selector: 'app-mission-d-profile',
  templateUrl: './mission-d-profile.component.html',
  styleUrls: ['./mission-d-profile.component.scss'],
})
export class MissionDProfileComponent {
  @Input() labelWidth = '200px';
  @Input() drawerLevel: number;
  @Output() handleConfigData = new EventEmitter<any>();
  @ViewChild('missionPublic') missionPublic: any;

  public i18n: any;
  public nodeParams: any = {};
  public form: any = {};
  public formGroup: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
  };

  constructor(private i18nService: I18nService, private formBuilder: FormBuilder) {
    this.i18n = this.i18nService.I18n();
    this.formGroup = this.formBuilder.group({
      ip: new FormControl('', [TiValidators.required, TiValidators.ipv4]),
      port: new FormControl(null, [TiValidators.minValue(1), TiValidators.maxValue(65535)]),
      username: new FormControl('', [TiValidators.required]),
      password: new FormControl('', [TiValidators.required]),
    });
  }

  // 确认
  public confirm() {
    const databaseConfig = this.formGroup.value;
    const params = {
      nickName: this.nodeParams.title.split('(')[0],
      formData: {
        sqlIp: databaseConfig.ip,
        sqlPort: databaseConfig.port || null,
        sqlUser: databaseConfig.username,
        sqlPwd: databaseConfig.password
      }
    };
    this.handleConfigData.emit(params);
    this.close();
  }

  // 打开
  public open(nodeParams: any) {
    this.nodeParams = nodeParams;
    this.missionPublic.open();

    this.formGroup.controls.ip.setValue(nodeParams.param.sqlIp);
    this.formGroup.controls.port.setValue(nodeParams.param.sqlPort || '');
    this.formGroup.controls.username.reset();
    this.formGroup.controls.password.reset();
  }
  // 关闭
  public close() {
    this.missionPublic.close();
  }
}
