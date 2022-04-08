import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { AbstractControl, ValidationErrors, ValidatorFn, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';
import { CustomValidatorsService } from '../../../../service';

@Component({
  selector: 'app-mission-s-profile',
  templateUrl: './mission-s-profile.component.html',
  styleUrls: ['./mission-s-profile.component.scss']
})
export class MissionSProfileComponent implements OnInit {
  @Input() labelWidth = '200px';
  @Input() drawerLevel: number;
  @Output() private handleConfigData = new EventEmitter<any>();
  @ViewChild('missionPublic') missionPublic: any;

  public i18n: any;
  public nodeParams: any = {};

  public form: any = {};
  public formGroup: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
  };

  constructor(
    public i18nService: I18nService,
    public fb: FormBuilder,
    public customValidatorsService: CustomValidatorsService) {
    this.i18n = this.i18nService.I18n();

    this.form = {
      cpuToBeSamples: {
        label: this.i18n.ddr.cpuToBeSamples,
        tip: this.i18n.tip_msg.common_term_task_crate_mask_tip,
        required: false
      },
      c_source: {
        label: this.i18n.common_term_task_crate_c_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_source_tip,
        required: false
      },
      cpu: {
        label: this.i18n.common_term_task_crate_interval_ms,
        required: true,
        tip: this.i18n.micarch.simpling_delay_tip,
        options: [
          {
            label: this.i18n.common_term_task_start_high_precision,
            id: 'higher',
          },
          {
            label: this.i18n.common_term_task_start_custerm,
            id: 'customize',
          },
        ],
        spinner: {
          placeholder: '1-999',
          min: 1,
          max: 999,
          format: 'N0',
          step: 1,
        },
        spinner_delay: {
          placeholder: '0-900',
          min: 0,
          max: 900,
          format: 'N0',
          step: 1,
          tailPrompt: this.i18n.common_term_sign_left + '0~900' + this.i18n.common_term_sign_right,
        },
        tailPrompt: this.i18n.common_term_sign_left + '1~999' + this.i18n.common_term_sign_right,
      },
    };
    this.formGroup = fb.group({
      cpuToBeSamples: new FormControl('', [this.customValidatorsService.checkSampCPUMask()]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
    });
  }

  ngOnInit() {}

  private validFilePath(errorMessage: string): ValidatorFn {
    const reg = /^([\/][^\/]+)*$/;

    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = (control.value || '').toString().trim();
      if (tmpValue === '' || tmpValue == null) { return null; }

      return reg.test(tmpValue)
        ? null
        : { filePath: { tiErrorMessage: errorMessage } };
    };
  }

  // 确认
  public confirm() {
    const params = {
      nickName: this.nodeParams.title.split('(')[0],
      formData: {
        cpuMask: this.formGroup.controls.cpuToBeSamples.value,
        sourceLocation: this.formGroup.controls.source_ctrl.value,
      }
    };
    this.handleConfigData.emit(params);
    this.close();
  }

  // 打开
  public open(nodeParams: any) {
    this.nodeParams = nodeParams;
    this.missionPublic.open();

    const e = nodeParams.param;
    if (Object.keys(e).length !== 0 && e.analysisType === 'microarchitecture'
    && e.analysisTarget === 'Profile System') {
      this.formGroup.controls.cpuToBeSamples.setValue(e.cpuMask);
      this.formGroup.controls.source_ctrl.setValue(e.sourceLocation);
    }
  }
  // 关闭
  public close() {
    this.missionPublic.close();
  }
}
