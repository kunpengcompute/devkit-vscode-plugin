import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { AxiosService } from '../../../../service/axios.service';
import { AbstractControl, ValidationErrors, ValidatorFn, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { CustomValidatorsService } from '../../../../service';
import { TiValidationConfig } from '@cloud/tiny3';
import { DeteleUsernamePasswordService } from './../detele-username-password.service';

@Component({
  selector: 'app-mission-c-launch',
  templateUrl: './mission-c-launch.component.html',
  styleUrls: ['./mission-c-launch.component.scss']
})
export class MissionCLaunchComponent {
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
  public runUserValid = true;
  public runPasswordValid = true;
  public modeAppRunUserValid = true;
  public runUserMsg: string;
  public isModifySchedule: boolean;

  constructor(
    public i18nService: I18nService,
    private Axios: AxiosService,
    public fb: FormBuilder,
    private vilidatorService: CustomValidatorsService,
    private deteleUsernamePasswordService: DeteleUsernamePasswordService
  ) {
    this.i18n = this.i18nService.I18n();

    this.form = {
      path: {
        label: this.i18n.common_term_task_crate_app_path,
        required: true,
      },
      params_c: {
        label: this.i18n.common_term_task_crate_parameters,
        required: false,
      },
      dire: {
        label: this.i18n.common_term_task_crate_work_director,
        required: true,
        options: [
          {
            label: this.i18n.common_term_task_start_path,
            id: 'application path',
          },
          {
            label: this.i18n.common_term_task_start_custerm,
            id: 'customize',
          },
        ],
      },
      b_s: {
        label: this.i18n.common_term_task_crate_bs_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_bs_tip,
        required: false,
      },
      c_source: {
        label: this.i18n.common_term_task_crate_c_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_source_tip,
        required: false,
      },
      runUserStatus: {
        label: this.i18n.common_term_task_crate_app_runUser,
        tip: this.i18n.mission_create.modeAppRunUser,
        required: false
      },
      user: {
        label: this.i18n.common_term_task_crate_app_user,
        required: true
      },
      password: {
        label: this.i18n.common_term_task_crate_app_passWord,
        required: true
      }
    };
    this.formGroup = fb.group({
      path_ctrl: new FormControl('', {
        validators: [this.vilidatorService.CheckApp.bind(this.vilidatorService)],
        updateOn: 'change',
      }),
      params_ctrl: new FormControl('', []),
      dire_ctrl: new FormControl('', []),
      dire_input_ctrl: new FormControl('', {
        updateOn: 'change',
      }),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      runUserStatus: new FormControl(false, {
        updateOn: 'change'
      }),
      user: new FormControl('', {
        updateOn: 'change'
      }),
      password: new FormControl('', {
        updateOn: 'change'
      }),
    });
  }

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
      nodeIp: this.nodeParams.nodeIP,
      formData: {
        assemblyLocation: this.formGroup.get('b_s_ctrl').value,
        sourceLocation: this.formGroup.get('source_ctrl').value,
        'app-dir': this.formGroup.get('path_ctrl').value,
        'app-parameters': this.formGroup.get('params_ctrl').value,
        'app-working-dir': this.formGroup.get('dire_input_ctrl').value,
      },
      runUser: {
        runUser: this.formGroup.get('runUserStatus').value,
        user: this.formGroup.get('user').value,
        password: this.formGroup.get('password').value
      },
    };
    this.handleConfigData.emit(params);
    this.close();
  }

  // 打开
  public open(nodeParams: any) {
    this.nodeParams = nodeParams;
    this.missionPublic.open();
    this.isModifySchedule = nodeParams.isModifySchedule;

    const e = nodeParams.param;
    if (Object.keys(e).length !== 0) {
      this.formGroup.get('path_ctrl').setValue(e['app-dir']);
      this.formGroup.get('params_ctrl').setValue(e['app-parameters']);
      this.formGroup.get('dire_input_ctrl').setValue(e['app-working-dir']);
      this.formGroup.get('b_s_ctrl').setValue(e.assemblyLocation);
      this.formGroup.get('source_ctrl').setValue(e.sourceLocation);
      if (nodeParams.runUser.runUser) {
        this.formGroup.get('runUserStatus').setValue(nodeParams.runUser.runUser);
        this.formGroup.get('user').setValue(nodeParams.runUser.user);
        this.formGroup.get('password').setValue(nodeParams.runUser.password);
      }
      this.checkUserOrPassWord('switch');
    }
  }

  // 关闭
  public close() {
    this.missionPublic.close();
    this.deteleUsernamePasswordService.deteleUsernameAndPassword(this.formGroup);
    this.runUserValid = true;
    this.runPasswordValid = true;
  }

  // check application path
  public checkApplicationPath_blur(modal: string): any {
    let ctrl: any;
    let currentMoal: any;
    let url = '/res-status/?type=application&application=';

    if (modal === 'LaunchItemsC') {
      ctrl = this.formGroup.controls;
      currentMoal = this.form;
    }
    if (ctrl.dire_ctrl.value.id === 'customize') {
      return false;
    } // 如果是自定义，就不往里面填
    if (ctrl.path_ctrl.value !== '') {
      url += ctrl.path_ctrl.value;
      this.Axios.axios
        .get(url)
        .then((resp: any) => {
          currentMoal.dire.saveValue = resp.data.address;
          ctrl.dire_input_ctrl.setValue(resp.data.address);
        })
        .catch((error: any) => { });
    }
  }
  public checkUserOrPassWord(str: string) {
    if (str === 'user') {
      this.runUserValid = Boolean(this.formGroup.controls.user.value);
      if (this.formGroup.controls.user.value === '') {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_empty_judge;
        this.runUserValid = false;
        this.modeAppRunUserValid = false;
        return;
      }
      const reg = new RegExp('^[a-zA-Z._][a-zA-Z0-9._\\-]{0,127}$');
      if (!reg.test(this.formGroup.controls.user.value)) {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_run_user_msg;
        this.runUserValid = false;
      } else {
        this.runUserValid = true;
      }
    } else if (str === 'password') {
      this.runPasswordValid = Boolean(this.formGroup.controls.password.value);
    }
    // 验证必选项
    if (this.formGroup.get('runUserStatus').value) {
      this.modeAppRunUserValid = Boolean(this.formGroup.get('user').value) &&
        Boolean(this.formGroup.get('password').value);
    } else {
      this.modeAppRunUserValid = true;
    }
  }
}
