import { Component, Input, OnChanges, SimpleChange, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { MissionCreatePidProcessControls } from './mission-create-pid-process';
import { PpEmitValue } from './mission-create-pid-process.component.types';
import { I18nService } from '../../../../service/i18n.service';
import { CustomValidatorsService } from 'sys/src-com/app/service';
import { ATTACH_PROCESS_PID_NUM_MAX } from 'sys/src-com/app/global/constant';

@Component({
    selector: 'app-mission-create-pid-process',
    templateUrl: './mission-create-pid-process.component.html',
    styleUrls: ['./mission-create-pid-process.component.scss']
})
export class MissionCreatePidProcessComponent implements OnInit, OnChanges {
    /** 入参：pid */
    @Input() pidValue: string;
    /** 入参：进程名称 */
    @Input() processValue: string;
    @Input()
    set changeType(type: string) {
        this.types = type;
    }
    /** 入参：控件状态 */
    @Input() isDisable: boolean;
    @Input() isModifySchedule: false;
    /** 至多可输入pid的数量 */
    @Input() atMostPid = ATTACH_PROCESS_PID_NUM_MAX;

    /** 数据更新主题：pid 和 进程名称 */
    @Output() updateValue = new EventEmitter<PpEmitValue>();

    /** 表单控件组 */
    public ppFormGroup: FormGroup;
    public ctl: { [key: string]: AbstractControl; };
    // 其他
    public i18n: any;
    public pid = '';
    public process = '';
    public types: string;
    public focus: string;
    public processPlaceholder: string;
    public readonly attachProcessPidNumMax = ATTACH_PROCESS_PID_NUM_MAX;
    private ppService: MissionCreatePidProcessControls;

    // 失焦校验
    validation: TiValidationConfig = {
        type: 'blur'
    };

    /**
     * 创建表单控件组，并初始化部分控件的状态和它们的交互逻辑
     * @param fb FormBuilder
     * @param ppService 本组件的服务类
     */
    constructor(
        private fb: FormBuilder,
        private i18nService: I18nService,
        private customValidatorsService: CustomValidatorsService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.ppService = new MissionCreatePidProcessControls(this.atMostPid ?? ATTACH_PROCESS_PID_NUM_MAX);

        this.ppService.getType(this.types);
        // 新建控件组
        this.ppFormGroup = this.fb.group({
            processCheck: new FormControl(true),
            processInput: new FormControl('', [
                this.customValidatorsService.processNameValidator, TiValidators.required
            ]),
            pidCheck: new FormControl(true),
            pidInput: new FormControl('', [TiValidators.required, this.ppService.pidInputValidator(this.i18n)]),
        });

        this.ctl = this.ppFormGroup.controls;

        // 初始化控件交互
        this.ppService.initControlsInteraction(this.ppFormGroup);

        // 订阅控件组的值变更主题，并将其同步到 updateVulue 主题
        this.ppFormGroup.valueChanges.subscribe(() => {
            const value = this.ppFormGroup.value;
            const valid = this.ppFormGroup.valid;
            this.updateValue.emit({
                pid: this.ppService.splitStr(value.pidInput || '').join(','),
                process: value.processInput || '',
                valid,
            });
        });
        this.checkState();
    }

    /**
     * Input 参数的变化时，将其赋值给相应的控件
     * @param changes 变化的 Input 参数
     */
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes.hasOwnProperty('pidValue')) {
            this.pid = this.pidValue;
            if (this.pidValue) {
                this.ctl.pidCheck.setValue(true);
            }
        }
        if (changes.hasOwnProperty('processValue')) {
            this.process = decodeURIComponent(this.processValue || '');
            if (this.processValue) {
                this.ctl.processCheck.setValue(true);
            }
        }
        if (changes.hasOwnProperty('pidValue') || changes.hasOwnProperty('processValue')) {
            this.ppFormGroup.controls.pidInput.setValue(this.pid || '');
            this.ppFormGroup.controls.processInput.setValue(this.process || '');
        }

        if (changes.hasOwnProperty('isDisable')) {
            if (changes.isDisable.currentValue) {
                this.ctl.processCheck.disable({ emitEvent: false });
                this.ctl.processInput.disable({ emitEvent: false });
                this.ctl.pidCheck.disable({ emitEvent: false });
                this.ctl.pidInput.disable({ emitEvent: false });
            } else {
                this.ctl.processCheck.enable({ emitEvent: false });
                this.ctl.processInput.enable({ emitEvent: false });
                this.ctl.pidCheck.enable({ emitEvent: false });
                this.ctl.pidInput.enable({ emitEvent: false });
            }
        }
    }
    private checkState() {
        this.processPlaceholder = this.i18n.mission_create.process_input_placeholder;
        if (!this.pid && !this.process) {
            this.ctl.processCheck.setValue(true);
            this.ctl.pidCheck.setValue(false);
        } else if (this.pid && this.process) {
            this.ctl.processCheck.setValue(true);
            this.ctl.pidCheck.setValue(true);
        } else if (this.pid || this.process) {
            this.ctl.processCheck.setValue(Boolean(this.process));
            this.ctl.pidCheck.setValue(Boolean(this.pid));
        }
    }
    /**
     * 单选
     * @param i i
     */
    public checkClick(i: 0 | 1) {
        if (i) {
            this.ctl.pidInput.setValue('');
            this.ctl.processInput.setValue(' ');
            this.ctl.pidCheck.setValue(true);
            this.ctl.processCheck.setValue(false);
        } else {
            this.ctl.processInput.setValue('');
            this.ctl.pidInput.setValue(' ');
            this.ctl.pidCheck.setValue(false);
            this.ctl.processCheck.setValue(true);
        }
    }

    public pidCheckChange() {
      this.ctl.pidInput.reset();
    }

    public processCheckChange() {
      this.ctl.processInput.reset();
    }
}
