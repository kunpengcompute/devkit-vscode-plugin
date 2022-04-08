import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { StorageIoDataService } from '../service';
import { CustomValidatorsService } from 'sys/src-com/app/service';
type diagnoseFunc = {
  id: string;
  label: string;
  checked: boolean;
  tip?: string;
  show?: boolean;
  disabled?: boolean;
};

@Component({
  selector: 'app-storage-io-schedule',
  templateUrl: './storage-io-schedule.component.html',
  styleUrls: ['./storage-io-schedule.component.scss']
})
export class StorageIoScheduleComponent implements OnInit {
  @Input() taskData: any;
  @Input() scheduleTaskId: number;
  @Input() projectId: number;
  @Input() labelWidth = '210px';
  @Output() confirmModify = new EventEmitter<string>();
  @Output() cancelModify = new EventEmitter<void>();
  constructor(
    private dataServe: StorageIoDataService,
    private validatorsServe: CustomValidatorsService
  ) {
    this.formGroup = this.initFormGroup();
    // 预约任务启动按钮监听
    this.formGroup.get('doOrder').valueChanges.subscribe((val) => {
      this.formOption.orderConfig.display = val;
      if (val) {
        this.formGroup.get('orderConfig').enable();
        this.formGroup.get('taskStartNow').patchValue(false);
        this.formOption.taskStartNow.display = false;
      } else {
        this.formGroup.get('orderConfig').disable();
        this.formGroup.get('taskStartNow').patchValue(true);
        this.formOption.taskStartNow.display = true;
      }
    });
    // 周期统计开关监听
    this.formGroup.get('cycleOn').valueChanges.subscribe((val) => {
      if (val) {
        this.formOption.cyclePeriod.display = true;
        this.formGroup.get('cyclePeriod').enable();
      } else {
        this.formOption.cyclePeriod.display = false;
        this.formGroup.get('cyclePeriod').disable();
        this.formGroup.get('cyclePeriod').patchValue(500);
      }
    });
  }
  public formGroup: FormGroup;
  public diagnosticFunc: diagnoseFunc[];

  // 参数配置项展示
  public formOption = {
    sysMonitor: { display: false },
    cyclePeriod: { display: true },
    doOrder: { display: false },
    orderConfig: { display: true },
    taskStartNow: { display: false },
  };
  ngOnInit(): void {
    this.diagnosticFunc = [
      {
        id: 'storageDiagnostic',
        label: I18n.storageIo.storage_io,
        checked: true,
        tip: I18n.storageIo.storage_io_select,
        show: true,
        disabled: true
      },
      {
        id: 'systemMonitor',
        label: I18n.storageIo.sys_load,
        checked: false,
        show: false,
        disabled: false
      }
    ];
    this.initTaskParams(this.taskData);
  }

  /**
   * 选择负载监控事件
   */
  public onNgModelChange(e: any, index: number) {
    this.formOption.sysMonitor.display = this.diagnosticFunc[index].checked;
  }
  /**
   * 初始化表单
   * @param taskName 任务名称
   * @returns 表单
   */
  private initFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      nodeConfig: new FormControl(),
      indicatorForm: new FormControl(),
      collectDuration: new FormControl(10,
        [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(300),
        ]),
      collectSeparation: new FormControl(
        1,
        [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(10),
          this.validatorsServe.validTheSizeRelationship({
            relatedFormControlName: 'collectDuration',
            tip: I18n.storageIo.storageInterval_tip,
            calcExpression: ([valueA, valueB]) => valueA <= valueB / 2,
          }),
        ]),
      cycleOn: new FormControl(false, []),
      cyclePeriod: new FormControl(500, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(5000),
        this.validatorsServe.validTheSizeRelationship({
          relatedFormControlName: 'collectDuration',
          tip: I18n.storageIo.cyclePeriod_tip,
          calcExpression: ([valueA, valueB]) => valueA / 1000 <= valueB,
        }),
      ]),
      collectSize: new FormControl(
        10,
        [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(100)
        ]),
      // 预约定时启动
      doOrder: new FormControl(),
      // 预约定时编辑控件
      orderConfig: new FormControl(),
      // 立即启动
      taskStartNow: new FormControl(true, []),
    });
    return formGroup;
  }

  onConfirm() {
    if (!this.formGroup.valid) {
      this.formGroup.markAsDirty();
      return;
    }
    const formData: any = (JSON.parse(JSON.stringify(this.formGroup.value)));
    formData.taskName = this.taskData.taskName;
    const diagnosticFunc: string[] = [];
    this.diagnosticFunc.forEach((item: any) => {
      if (item.checked) {
        diagnosticFunc.push(item.id);
      }
    });
    const isChooseSysMonitor = this.formOption.sysMonitor.display;
    const rawData = this.dataServe.transformReqData(
      formData,
      diagnosticFunc,
      this.taskData?.projectName,
      isChooseSysMonitor
    );
    this.dataServe.pushScheduleData(
      this.scheduleTaskId,
      rawData,
      this.confirmModify
    );
  }

  onCancel() {
    this.cancelModify.emit();
  }
  /**
   * 修改预约任务初始化
   * @param val 后台返回任务信息
   */
  public initTaskParams(val: any) {
    const fgValue = this.dataServe.transformResData(val);
    // 表单初始化
    this.formGroup.patchValue(fgValue);
    // 诊断功能
    this.diagnosticFunc?.forEach((item: any) => {
      item.checked = val.diagnosticFunc?.includes(item.id);
    });
  }
}
