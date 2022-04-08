import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomValidatorsService } from 'sys/src-com/app/service';
import { I18n } from 'sys/locale';
import { TiValidationConfig } from '@cloud/tiny3';
import { PartialObserver } from 'rxjs';

interface PidProcess {
  processName?: string;
  processPid?: string;
}

@Component({
  selector: 'app-mem-process-pid',
  templateUrl: './mem-process-pid.component.html',
  styleUrls: ['./mem-process-pid.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MemProcessPidComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MemProcessPidComponent),
      multi: true
    }
  ],
})
export class MemProcessPidComponent implements OnInit {
  @Input() attachRadioName = 'attachRadio';
  @Input() labelWidth = '210px';
  @Input() inputWidth = '326px';
  @Input()
  set pidProcess(val: PidProcess) {
    if (null == val) {
      return;
    }
    this.initFormValue(val);
  }
  @Input()
  set disabled(val: boolean) {
    setTimeout(() => {
      this.radioDisable = val;
      if (val) {
        // 配置指定节点打开，禁用输入框
        this.pidProcessGroup?.get(this.attachRadioValue).disable();
      } else {
        this.pidProcessGroup?.get(this.attachRadioValue).enable();
      }
    }, 0);
  }

  constructor(public customValidatorsService: CustomValidatorsService) { }
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public radioList = [
    {
      key: I18n.mission_create.process_alias,
      id: 'processName'
    }, {
      key: 'PID',
      id: 'processPid',
    }];
  public pidProcessGroup: FormGroup;
  public attachRadioValue = 'processName';
  public radioDisable = false;

  ngOnInit(): void {
    this.initPidProcessGroup();
  }

  /**
   * 初始化系统诊断内存 attach to process模式表单
   */
  private initPidProcessGroup() {
    this.pidProcessGroup = new FormGroup({
      processName: new FormControl('', [this.customValidatorsService.checkEmpty(),
      this.customValidatorsService.processNameValidator]),
      processPid: new FormControl(null, [this.customValidatorsService.checkEmpty(),
      this.customValidatorsService.memProcessPidValidator]),
    });
    this.pidProcessGroup.get('processPid').disable();
    const valueObserver: PartialObserver<any> = {
      next: (val) => {
        this.propagateChange(val);
      },
    };
    this.pidProcessGroup.valueChanges.subscribe(valueObserver);
  }
  /**
   * 重启修改时数据回显
   * @param val 初始化值
   */
  public initFormValue(val: PidProcess) {
    val.processName = val.processName ? val.processName : '';
    val.processPid = val.processPid ? val.processPid : '';
    this.attachRadioValue = val.processName !== '' ? 'processName' : 'processPid';
    this.pidProcessGroup.patchValue(val);
    if (val.processName !== '') {
      this.pidProcessGroup.get('processName').enable();
      this.pidProcessGroup.get('processPid').disable();
    } else {
      this.pidProcessGroup.get('processPid').enable();
      this.pidProcessGroup.get('processName').disable();
    }
  }

  /**
   * 目标进程的单选change事件
   * @param processName processPid
   */
  public ngRadioModelChange(e: any) {
    if (e === 'processName') {
      this.pidProcessGroup.get('processName').enable();
      this.pidProcessGroup.get('processPid').reset();
      this.pidProcessGroup.get('processPid').disable();
    } else {
      this.pidProcessGroup.get('processName').reset();
      this.pidProcessGroup.get('processName').disable();
      this.pidProcessGroup.get('processPid').enable();
    }
  }

  private propagateChange = (_: PidProcess) => { };
  private propagateTunched = (_: any) => { };

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }
  validate(ctl: FormControl) {
    return this.pidProcessGroup.valid ? null : { pidProcess: { valid: false } };
  }
  registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }
  writeValue(val: any) {
    this.pidProcess = val;
  }
}


