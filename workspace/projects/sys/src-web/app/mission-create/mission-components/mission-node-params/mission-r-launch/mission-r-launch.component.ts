import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { AxiosService } from '../../../../service/axios.service';
import { AbstractControl, ValidationErrors, ValidatorFn, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { CustomValidatorsService } from '../../../../service';
import { TiValidationConfig } from '@cloud/tiny3';
import { TaskService } from '../../../../service/taskService/nodeList.service';
import { DeteleUsernamePasswordService } from './../detele-username-password.service';
import { AnalysisType } from 'projects/sys/src-com/app/domain';

@Component({
  selector: 'app-mission-r-launch',
  templateUrl: './mission-r-launch.component.html',
  styleUrls: ['./mission-r-launch.component.scss']
})
export class MissionRLaunchComponent implements OnInit {
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
  public runPasswordValid = true;
  public runPasswordMsg: string;

  public runUserValid = true;
  public runUserMsg: string;

  public isShowAppDirMsg = true;
  public appDirMsg: string;
  public modeAppRunUserValid = true;
  public isModifySchedule: boolean;

  constructor(
    public i18nService: I18nService,
    private Axios: AxiosService,
    public fb: FormBuilder,
    private vilidatorService: CustomValidatorsService,
    public taskServices: TaskService,
    private deteleUsernamePasswordService: DeteleUsernamePasswordService) {
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
      openMP: {
        label: this.i18n.hpc.mission_create.openMpParams,
        required: false,
      },
      dire: {
        label: this.i18n.common_term_task_crate_work_director,
        required: true,
        options: [
          {
            label: this.i18n.common_term_task_start_path,
            id: 'application path'
          }, {
            label: this.i18n.common_term_task_start_custerm,
            id: 'customize'
          }
        ]
      },
      b_s: {
        label: this.i18n.common_term_task_crate_bs_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_bs_tip,
        required: false
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
        updateOn: 'change'
      }),
      params_ctrl: new FormControl('', []),
      dire_ctrl: new FormControl('', []),
      openMpParams: new FormControl('', []),
      dire_input_ctrl: new FormControl('', {
        updateOn: 'change'
      }),
      b_s_ctrl: new FormControl('', [
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
  public requireBlur(str: string) {
    switch (str) {
      case 'appDir':
        const appDirValue = this.formGroup.get('path_ctrl').value;
        if (appDirValue === '') {
          this.appDirMsg = this.i18n.tip_msg.system_setting_input_empty_judge;
          this.isShowAppDirMsg = false;
          return;
        }
        this.isShowAppDirMsg = true;
        break;
      default: break;
    }
  }

  // 确认
  public confirm() {
    const params = {
      nickName: this.nodeParams.title.split('(')[0],
      nodeIp: this.nodeParams.nodeIP,
      formData: {
        'app-dir': this.formGroup.get('path_ctrl').value,
        'app-parameters': this.formGroup.get('params_ctrl').value,
        assemblyLocation: this.formGroup.get('b_s_ctrl').value,
        open_mp_param: this.formGroup.get('openMpParams').value
      },
      runUser: {
        runUser: this.formGroup.get('runUserStatus').value,
        user: this.formGroup.get('user').value,
        password: this.formGroup.get('password').value
      }
    };
    this.handleConfigData.emit(params);
    this.close();
  }

  // 打开
  public open(nodeParams: any) {
    this.nodeParams = nodeParams;
    this.isModifySchedule = nodeParams.isModifySchedule;
    this.missionPublic.open();

    const e = nodeParams.param;
    this.analysisType = e['analysis-type'];
    if (Object.keys(e).length !== 0
      && (this.analysisType === AnalysisType.Hpc || this.analysisType === AnalysisType.ResouSchedule)
      && e['analysis-target'] === 'Launch Application') {
      this.formGroup.get('path_ctrl').setValue(e['app-dir']);
      this.formGroup.get('params_ctrl').setValue(e['app-parameters']);
      this.formGroup.get('b_s_ctrl').setValue(e.assemblyLocation);
      this.formGroup.get('openMpParams').setValue(e.open_mp_param);
      if (nodeParams.runUser.runUser) {
        if (this.analysisType === AnalysisType.Hpc) {
          this.formGroup.get('runUserStatus').setValue(nodeParams.runUser.runUser);
          this.formGroup.get('user').setValue(nodeParams.runUser.user);
          this.formGroup.get('password').setValue(nodeParams.runUser.password);
        }
        else if (this.analysisType === AnalysisType.ResouSchedule) {
          this.formGroup.get('runUserStatus').setValue(nodeParams.runUser.runUser);
          this.formGroup.get('user').setValue(nodeParams.runUser.user);
          this.formGroup.get('password').setValue(nodeParams.runUser.password);
        }
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

  public checkApplicationPath_blur(modal: string): any {
    let ctrl: any;
    let currentMoal: any;
    let url = '/res-status/?type=application&application=';

    if (modal === 'LaunchItemsR') {
      ctrl = this.formGroup.controls;
      currentMoal = this.form;
    }
    if (ctrl.dire_ctrl.value.id === 'customize') { return false; } // 如果是自定义，就不往里面填
    if (ctrl.path_ctrl.value !== '') {
      url += ctrl.path_ctrl.value;
      this.Axios.axios.get(url)
        .then((resp: any) => {
          currentMoal.dire.saveValue = resp.data.address;
          ctrl.dire_input_ctrl.setValue(resp.data.address);
        })
        .catch((error: any) => { });
    }
  }

  public directory_change(data: any, modal: any) {
    let ctrls: any;
    if (modal === 'LaunchItemsR') {
      ctrls = this.formGroup.controls;
    }
    if (data.id === 'customize') {
      ctrls.dire_input_ctrl.enable();
      ctrls.dire_input_ctrl.setValue('');
    } else {
      ctrls.dire_input_ctrl.disable();
      ctrls.dire_input_ctrl.setValue('');
    }
  }
  public changeAppDire(type: any) {

  }
  public checkUserOrPassWord(str: string) {
    if (str === 'user') {
      this.runUserValid = Boolean(this.formGroup.controls.user.value);
      if (this.formGroup.controls.user.value === '') {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_empty_judge;
        this.modeAppRunUserValid = false;
        this.runUserValid = false;
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
    if (this.formGroup.controls.runUserStatus.value) {
      this.modeAppRunUserValid = Boolean(this.formGroup.controls.user.value)
        && Boolean(this.formGroup.controls.password.value);
    } else {
      this.modeAppRunUserValid = true;
    }
  }
}
