import { Component, OnInit, ViewChild, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { CustomValidatorsService } from '../../../service';
import { TiValidationConfig, TiValidators } from '@cloud/tiny3';

@Component({
    selector: 'app-mission-diagnosis-launch',
    templateUrl: './mission-diagnosis-launch.component.html',
    styleUrls: ['./mission-diagnosis-launch.component.scss']
})
export class MissionDiagnosisLaunchComponent implements OnInit {

    @Input() nodeConfigedData: any;
    @Input() currentCreateType: number;
    @Input() showCFile = true;

    @Output() private handleConfigData = new EventEmitter<any>();

    @ViewChild('missionSliding') missionSliding: any;

    public i18n: any;
    public nodeParams: any = {};
    public labelWidth = '200px';

    /** pid 和 进程名称输入的控件 */
    public pidProcessGroup: FormGroup;
    public attachData: any;

    public isAtttach = false; // 是否为 attach 模式
    public form: any = {};
    public formGroup: FormGroup;
    public userFormGroup: FormGroup;
    public validation: TiValidationConfig = {
        type: 'blur',
    };

    constructor(
        public i18nService: I18nService,
        public fb: FormBuilder,
        private vilidatorService: CustomValidatorsService,
        private cdr: ChangeDetectorRef
    ) {
        this.i18n = this.i18nService.I18n();

        this.attachData = {
          processPid: '', // PID
          processName: '', // 进程名称
        };
        this.form = {
            path: {
                label: this.i18n.common_term_task_crate_app_path,
                required: true,
            },
            params_c: {
                label: this.i18n.common_term_task_crate_parameters,
                required: false,
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
        this.initFormGroup(false);
        this.initPidProcessGroup();
    }
    public btnCheck = false;
    ngOnInit() { }

    /**
     * 初始化 Attach to Process 表单
     */
    private initPidProcessGroup() {
      this.pidProcessGroup = new FormGroup({
         pidProcess: new FormControl(),
      });
      this.pidProcessGroup.valueChanges.subscribe((val) => {
        this.attachData.processName = val.pidProcess?.processName || '';
        this.attachData.processPid = val.pidProcess?.processPid || '';
        this.checkValid();
      });
    }

    // 确认
    public confirm() {
        const newParams = !this.isAtttach
          ? {
            appDir: this.formGroup.controls.path_ctrl.value,
            appParameters: this.formGroup.controls.params_ctrl.value,
          }
          : {
            processPid: this.attachData.processPid,
            processName: this.attachData.processName,
          };
        let params = {
          nodeIp: this.nodeParams.nodeIp,
          formData: {
            assemblyLocation: this.formGroup.controls.b_s_ctrl.value,
            sourceLocation: this.formGroup.controls.source_ctrl.value,
            ...newParams
          }
        };
        params = !this.isAtttach
          ? Object.assign(params, {
            runUserSwitch: this.userFormGroup.get('runUserStatus').value,
            runUser: {
              user_name: this.userFormGroup.get('runUserStatus').value
                ? this.userFormGroup.get('user').value
                : 'launcher',
              password: this.userFormGroup.get('runUserStatus').value ? this.userFormGroup.get('password').value : ''
            }
          })
          : params;
        this.handleConfigData.emit(params);
        this.close();
    }

    // 打开
    public open(nodeParams: any) {
        this.isAtttach = nodeParams.analysisTarget === 'Attach to Process';
        this.nodeParams = nodeParams;
        const nodeConfigedData = this.nodeConfigedData.find((item: any) => {
            return item.nodeIp === nodeParams.nodeIp;
        });
        this.missionSliding.open();

        this.initFormGroup(this.isAtttach);
        if (Object.keys(nodeParams.param).length !== 0) {
            this.formGroup.controls.b_s_ctrl.setValue(
              nodeConfigedData?.formData?.assemblyLocation || nodeParams.param.assemblyLocation
            );
            this.formGroup.controls.source_ctrl.setValue(
              nodeConfigedData?.formData?.sourceLocation || nodeParams.param.sourceLocation
            );
            if (!this.isAtttach) {
              this.formGroup.controls.path_ctrl.setValue(nodeConfigedData?.formData?.appDir || nodeParams.param.appDir);
              this.formGroup.controls.params_ctrl.setValue(
                nodeConfigedData?.formData?.appParameters || nodeParams.param.appParameters
              );
              this.userFormGroup.get('runUserStatus')
              .setValue(nodeConfigedData?.runUserSwitch || nodeParams.runUserSwitch);
              this.userFormGroup.get('user')
                .setValue(nodeConfigedData?.runUser.user_name || nodeParams.runUser.user_name);
              this.userFormGroup.get('password')
                .setValue(nodeConfigedData?.runUser.password || nodeParams.runUser.password);
            } else {
              let processPid = '';
              let processName = '';
              if (nodeConfigedData.formData.processName === '' && nodeConfigedData.formData.processPid === ''){
               processPid = nodeParams.param.processPid;
               processName = nodeParams.param.processName;
              }else{
                processPid = nodeConfigedData.formData.processPid;
                processName = nodeConfigedData.formData.processName;
              }
              this.pidProcessGroup.get('pidProcess').patchValue({ processPid, processName });
            }
        }
    }

    /**
     * 重置表单规则
     * @param isAttach 是否为 attach
     */
     initFormGroup(isAttach: boolean) {
      if (!isAttach) {
        this.formGroup = this.fb.group({
          path_ctrl: new FormControl('', {
            validators: [this.vilidatorService.CheckApp.bind(this.vilidatorService)],
            updateOn: 'change'
          }),
          params_ctrl: new FormControl('', []),
          b_s_ctrl: new FormControl('', [this.vilidatorService.pathValidator()]),
          source_ctrl: new FormControl('', [this.vilidatorService.pathValidator()])
        });
        this.userFormGroup = this.fb.group({
          runUserStatus: new FormControl(false, {
            updateOn: 'change'
          }),
          user: new FormControl('', [this.vilidatorService.checkEmpty(),
            this.vilidatorService.runUserNameValidator(), TiValidators.required]),
          password: new FormControl('', [this.vilidatorService.checkEmpty(), TiValidators.required])
        });
      } else {
        this.formGroup = this.fb.group({
          b_s_ctrl: new FormControl('', [this.vilidatorService.pathValidator()]),
          source_ctrl: new FormControl('', [this.vilidatorService.pathValidator()])
        });
      }
    }

    // 关闭
    public close() {
        this.missionSliding.close();
    }

    public checkValid() {
        if (this.userFormGroup.controls.runUserStatus.value) {
            this.btnCheck = !this.formGroup.valid || !this.userFormGroup.valid;
        } else {
          const param = this.isAtttach ? !this.pidProcessGroup.valid : false;
          this.btnCheck = !this.formGroup.valid || param;
        }
    }
}
