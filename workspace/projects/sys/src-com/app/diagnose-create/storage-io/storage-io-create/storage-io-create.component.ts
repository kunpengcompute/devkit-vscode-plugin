import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { StorageIoDataService } from '../service';
import { CustomValidatorsService } from 'sys/src-com/app/service';
import { StorageCreateForm } from '../domain';
enum ActionType {
  Create = 'create',
  Restart = 'restart',
  Edit = 'edit',
}
type diagnoseFunc = {
  id: string;
  label: string;
  checked: boolean;
  tip?: string;
  show?: boolean;
  disabled?: boolean;
};
@Component({
  selector: 'app-storage-io-create',
  templateUrl: './storage-io-create.component.html',
  styleUrls: ['./storage-io-create.component.scss']
})
export class StorageIoCreateComponent implements OnInit {
  @Output() sendMissionKeep = new EventEmitter<any>();
  @Output() errorTips = new EventEmitter<any>();
  @Output() private closeTab = new EventEmitter<any>();
  @Input() actionType: ActionType = ActionType.Create;
  @Input() projectName: string;
  @Input() taskDetail: any;
  @Input() labelWidth = '210px';
  @Input() projectId = +sessionStorage.getItem('projectId');
  @Input()
  set storageIoInfo(val: StorageCreateForm) {
    if (null == val) {
      return;
    }
    this.initTaskParams(val);
  }
  @Input()
  set taskName(val: string) {
    this.taskNameStash = val;
    this.formGroup?.get('taskName')?.setValue(val);
    this.formGroup?.updateValueAndValidity();
  }
  get taskName() {
    return this.taskNameStash;
  }
  constructor(
    private dataServe: StorageIoDataService,
    private validatorsServe: CustomValidatorsService
  ) {
    this.formGroup = this.initFormGroup(this.taskName);
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
        this.formGroup.get('cyclePeriod').patchValue(500);
        this.formGroup.get('cyclePeriod').disable();
      }
    });
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
  }
  private taskNameStash: string;
  public formGroup: FormGroup;
  public diagnosticFunc: diagnoseFunc[];

  // 参数配置项展示
  public formOption = {
    sysMonitor: { display: false },
    cyclePeriod: { display: true },
    doOrder: { display: true },
    orderConfig: { display: false },
    taskStartNow: { display: true },
  };
  ngOnInit(): void {
    // 判断行为类型
    switch (this.actionType) {
      case ActionType.Create:
        break;
      case ActionType.Edit:
        this.formOption.doOrder.display = false;
        this.formGroup.get('doOrder').patchValue(false);
        this.formGroup.get('taskStartNow').patchValue(false);
        break;
      case ActionType.Restart:
        this.formOption.doOrder.display = false;
        this.formGroup.get('doOrder').patchValue(false);
        this.formGroup.get('taskStartNow').patchValue(true);
        this.formOption.taskStartNow.display = false;
        break;
      default:
        break;
    }
  }

  // 选择负载监控事件
  public onNgModelChange(e: any, index: number) {
    this.formOption.sysMonitor.display = this.diagnosticFunc[index].checked;
  }

  /**
   * 初始化表单
   * @param taskName 任务名称
   * @returns 表单
   */
  private initFormGroup(taskName: string): FormGroup {
    const formGroup = new FormGroup({
      taskName: new FormControl(taskName, [
        TiValidators.required,
        TiValidators.regExp('^[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$'),
      ]),
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
      cycleOn: new FormControl(true, []),
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


  /**
   * 创建任务、重启任务、修改任务
   */
  onCreate() {
    if (!this.formGroup.valid) {
      this.formGroup.markAsDirty();
      return;
    }
    const formData: any = this.formGroup.value;
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
      this.projectName,
      isChooseSysMonitor
    );
    const { doOrder, taskStartNow } = formData;
    switch (this.actionType) {
      case ActionType.Create:
        this.dataServe.createNewTask(
          rawData,
          doOrder,
          taskStartNow,
          this.projectName,
          this.closeTab,
          this.errorTips
        );
        break;
      case ActionType.Edit:
        this.dataServe.editTask(
          rawData,
          this.taskDetail.id,
          this.projectName,
          taskStartNow,
          this.closeTab,
          this.errorTips
        );
        break;
      case ActionType.Restart:
        this.dataServe.restartTask(
          rawData,
          this.taskDetail.id,
          this.projectName,
          this.closeTab,
          this.errorTips
        );
        break;
      default:
        break;
    }
  }
  /**
   * 关闭页签
   */
  public cancalTab() {
    this.closeTab.emit({});
  }

  /**
   * 重启、修改时数据初始化
   * @param val 后台返回任务信息
   */
  public initTaskParams(val: StorageCreateForm) {
    const fgValue = this.dataServe.transformResData(val);
    // 表单初始化
    this.formGroup.patchValue(fgValue);
    // 诊断功能
    this.diagnosticFunc?.forEach((item: any) => {
      item.checked = val.diagnosticFunc?.includes(item.id);
    });
    this.formOption.sysMonitor.display = val.diagnosticFunc?.includes('systemMonitor');
  }
  onSaveTemplate() {
    if (!this.formGroup.valid) {
      this.formGroup.markAsDirty();
      return;
    }
    const formData: any = this.formGroup.value;
    const diagnosticFunc: string[] = [];
    this.diagnosticFunc.forEach((item: any) => {
      if (item.checked) {
        diagnosticFunc.push(item.id);
      }
    });
    const rawData = this.dataServe.transformReqData(
      formData,
      diagnosticFunc,
      this.projectName
    );
    this.sendMissionKeep.emit(rawData);
  }
}
