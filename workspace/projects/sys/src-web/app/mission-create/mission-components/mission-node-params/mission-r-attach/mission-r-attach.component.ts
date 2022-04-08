import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { AbstractControl, ValidationErrors, ValidatorFn, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';
import { PidProcess } from '../../../domain';
import { AnalysisType } from 'projects/sys/src-com/app/domain';

@Component({
  selector: 'app-mission-r-attach',
  templateUrl: './mission-r-attach.component.html',
  styleUrls: ['./mission-r-attach.component.scss']
})
export class MissionRAttachComponent implements OnInit {
  @Input() labelWidth = '200px';
  @Input() drawerLevel: number;
  @Output() private handleConfigData = new EventEmitter<any>();
  @ViewChild('missionPublic') missionPublic: any;

  public i18n: any;
  public nodeParams: any = {};
  public analysisType: string;
  public form: any = {};
  public formGroup: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
  };

  constructor(public i18nService: I18nService, public fb: FormBuilder) {
    this.i18n = this.i18nService.I18n();

    this.form = {
      p_t: {
        label: this.i18n.common_term_task_crate_pid,
        required: true,
        value: ''
      },
      b_s: {
        label: this.i18n.common_term_task_crate_bs_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_bs_tip,
        required: false
      },
    };
    this.formGroup = fb.group({
      p_t_ctrl: new FormControl(),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ])
    });
  }

  ngOnInit() { }

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
    const { pid, process } = (this.formGroup.controls.p_t_ctrl.value as PidProcess);
    let params: any;
    if (this.analysisType === AnalysisType.Hpc) {
      params = {
        nickName: this.nodeParams.title.split('(')[0],
        formData: {
          process_name: process || '',
          targetPid: pid || '',
          assemblyLocation: this.formGroup.controls.b_s_ctrl.value,
        }
      };
    } else {
      params = {
        nickName: this.nodeParams.title.split('(')[0],
        formData: {
          'process-name': process || '',
          'target-pid': pid || '',
          assemblyLocation: this.formGroup.controls.b_s_ctrl.value,
        }
      };
    }

    this.handleConfigData.emit(params);
    this.close();
  }

  // 打开
  public open(nodeParams: any) {
    this.nodeParams = nodeParams;
    this.missionPublic.open();
    const e = nodeParams.param;
    this.analysisType = e['analysis-type'];
    if (Object.keys(e).length !== 0) {
      const pidProcess: PidProcess = {
        pid: e['target-pid'] || e.targetPid,
        process: e['process-name'] || e.process_name,
      };
      this.formGroup.controls.p_t_ctrl.setValue(pidProcess);
      this.formGroup.controls.b_s_ctrl.setValue(e.assemblyLocation);
    }
  }
  // 关闭
  public close() {
    this.missionPublic.close();
  }
}
