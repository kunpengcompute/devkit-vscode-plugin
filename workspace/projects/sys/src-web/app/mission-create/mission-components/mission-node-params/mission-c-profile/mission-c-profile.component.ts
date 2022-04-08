import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { AbstractControl, ValidationErrors, ValidatorFn, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';
import { CustomValidatorsService } from '../../../../service';

@Component({
  selector: 'app-mission-c-profile',
  templateUrl: './mission-c-profile.component.html',
  styleUrls: ['./mission-c-profile.component.scss']
})
export class MissionCProfileComponent implements OnInit {
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
      b_s: {
        label: this.i18n.common_term_task_crate_bs_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_bs_tip,
        required: false
      },
      c_source: {
        label: this.i18n.common_term_task_crate_c_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_source_tip,
        required: false
      },
    };
    this.formGroup = fb.group({
      cpuToBeSamples: new FormControl('', [this.customValidatorsService.checkSampCPUMask()]),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
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
        'cpu-mask': this.formGroup.controls.cpuToBeSamples.value,
        assemblyLocation: this.formGroup.controls.b_s_ctrl.value,
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
    if (Object.keys(e).length !== 0) {
      this.formGroup.controls.cpuToBeSamples.setValue(e['cpu-mask']);
      this.formGroup.controls.b_s_ctrl.setValue(e.assemblyLocation);
      this.formGroup.controls.source_ctrl.setValue(e.sourceLocation);
    }
  }

  // 关闭
  public close() {
    this.missionPublic.close();
  }
}
