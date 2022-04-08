import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';
import { Subscription } from 'rxjs';
import { RespCommon } from 'sys/src-com/app/domain';
import { LANGUAGE_TYPE, STATUS_CODE, USER_ROLE } from 'sys/src-com/app/global/constant';
import { HttpService, I18nService, TipService } from 'sys/src-com/app/service';
import { OptimizationTypeEnum, ServiceType, ServiceTypeValue, SuggestionSelectValue } from '../../../../domain';
import {
  TaskDetailMessageService,
  TopologyTreeMessageType,
  TopologyTreeMessageData,
  suggestionSelectChangeData,
  TopologyTreeMessageDetail
} from '../../../../service/topology-tree';
import { TuninghelperStatusService } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { TreeRespData } from '../../domain';
import { Threshold } from '../../domain/tree-optimization-sug.type';


// 表单项
interface ThresholdFormItem {
  id: number;
  label: string;
  expected_value: number;
  indicator: string;
  desc: string;  // 阈值说明
  value: string;  // 采集值
}

// 阈值设置表单类型
interface Config {
  id: number;
  expected_value: number;
  indicator: string;
}

// 设置阈值传参类型
interface ThresholdParam {
  nodeId: number;
  config: Config[];
}

@Component({
  selector: 'app-threshold-setting',
  templateUrl: './threshold-setting.component.html',
  styleUrls: ['./threshold-setting.component.scss']
})
export class ThresholdSettingComponent implements OnInit, OnChanges, OnDestroy {

  @Input() thresholdData: Threshold[] = [];
  @Input() optimizationType: OptimizationTypeEnum;

  public i18n: any;
  public thresholdFormGroup: FormGroup;
  private thresholdFormObj: any = {};
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public thresholdForm: ThresholdFormItem[] = [];  // 阈值设置表单
  public memoryFreeForm: ThresholdFormItem[] = [];  // 阈值设置表单
  public hasAuthotity = false;
  public averageCollectedValue = ['die_mem_percentage', 'span_die_percentage'];  // 属于平均采集值的指标项
  private otherForm = ['memory_free', 'swappiness'];  // 系统配置
  public formItemTcp = ['tcp_wmem', 'tcp_rmem'];  // 每个字段会返回三个数值
  /** 优化建议类型 */
  public optimizationTypes: {
    [name in OptimizationTypeEnum]: OptimizationTypeEnum
  } = {
    systemConfig: OptimizationTypeEnum.systemConfig,
    hotFunction: OptimizationTypeEnum.hotFunction,
    systemPerf: OptimizationTypeEnum.systemPerf,
    processPerf: OptimizationTypeEnum.processPerf,
  };
  public isIO = true;  // 默认是IO密集型
  private serviceTypeChangeSub: Subscription;
  private taskDetailSub: Subscription;
  public isDisabled = false;

  constructor(
    private i18nService: I18nService,
    public statusService: TuninghelperStatusService,
    private http: HttpService,
    private taskDetailMessageService: TaskDetailMessageService,
    private tipServe: TipService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    // 系统配置
    if (this.optimizationType === this.optimizationTypes.systemConfig) {
      // 监听业务类型改变
      this.serviceTypeChangeSub = this.statusService.serviceTypeChange.subscribe({
        next: (serviceType: Array<ServiceType>) => {
          this.isIO = false;
          for (const item of serviceType) {
            if (item.checked && (item.value === ServiceTypeValue.Network
              || item.value === ServiceTypeValue.Disk)) { // io密集型
              this.isIO = true;
              return;
            }
          }
        }
      });
    }

    // 选择全部建议则禁用
    this.isDisabled = this.statusService.suggestionSelect === SuggestionSelectValue.AllSuggestion ? true : false;

    // 建议范围改变
    this.taskDetailSub = this.taskDetailMessageService.getMessege({
      next: (message: TopologyTreeMessageDetail<suggestionSelectChangeData>) => {
        if (message.type === TopologyTreeMessageType.suggestionSelectChange) {
          if (!this.hasAuthotity || message.data.suggestionSelect === SuggestionSelectValue.AllSuggestion) {
            this.isDisabled = true;
          } else {
            this.isDisabled = false;
          }

          if (this.thresholdFormGroup) {
            if (this.isDisabled) {
              Object.keys(this.thresholdFormGroup.controls).forEach(key => {
                this.thresholdFormGroup.controls[key].disable();
              });
            } else {
              Object.keys(this.thresholdFormGroup.controls).forEach(key => {
                this.thresholdFormGroup.controls[key].enable();
              });
            }
          }
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.thresholdData) {
      this.judgeAuth();
      if (this.thresholdData.length) {
        this.formatThresholdData(this.thresholdData);
        this.initThresholdFormGroup();
      }
    }
  }

  ngOnDestroy(): void {
    this.serviceTypeChangeSub?.unsubscribe();
    this.taskDetailSub?.unsubscribe();
  }

  /**
   * 判断权限
   */
  private judgeAuth() {
    const ownerId = sessionStorage.getItem('loginId');
    const role = sessionStorage.getItem('role');
    if (ownerId === this.statusService.ownerId || USER_ROLE.ADMIN === role) {
      this.hasAuthotity = true;
    } else {
      this.hasAuthotity = false;
    }
  }

  /**
   * 初始化表单校验
   */
  private initThresholdFormGroup() {
    this.thresholdFormObj = {};

    const thresholdFormValid = (formList: ThresholdFormItem[]) => {
      formList.forEach((item: ThresholdFormItem) => {
        let validatorFn: any;
        if (this.formItemTcp.includes(item.indicator)) {  // 这两个字段有三个值，不需要校验
          validatorFn = this.thresholdTcpValidator;
        }else if (item.label.includes('%')) {  // 百分比
          validatorFn = this.thresholdPercentValidator;
        } else {  // 数值
          validatorFn = this.thresholdValidator;
        }
        Object.assign(this.thresholdFormObj, {[item.indicator]: new FormControl(
          item.expected_value, [validatorFn])});
      });
    };
    thresholdFormValid(this.thresholdForm);
    if (this.optimizationType === OptimizationTypeEnum.systemConfig) {  // 系统配置 内存空闲率
      thresholdFormValid(this.memoryFreeForm);
    }
    this.thresholdFormGroup = new FormGroup(this.thresholdFormObj);
    if (!this.hasAuthotity || this.statusService.suggestionSelect === SuggestionSelectValue.AllSuggestion) {
      Object.keys(this.thresholdFormGroup.controls).forEach(key => {
        this.thresholdFormGroup.controls[key].disable();
      });
    }
  }

  /**
   * 阈值百分比输入校验
   */
  thresholdPercentValidator = (control: FormControl) => {
    const reg = new RegExp(/^[0-9]*$/);  // 整数
    if (!control.value.trim()) {
      return { res: { tiErrorMessage: this.i18n.common_term_projiect_name_null, type: 'blur'} };
    } else if (!reg.test(control.value) || control.value < 0 || control.value > 100) {
      return { res: { tiErrorMessage: this.i18n.validata.integer_rule, type: 'blur'} };
    } else {
      return {};
    }
  }

  /**
   * 阈值数值输入校验
   */
  thresholdValidator = (control: FormControl) => {
    const reg = new RegExp(/^[1-9][0-9]*$/);  // 正整数
    if (!control.value.trim()) {
      return { res: { tiErrorMessage: this.i18n.common_term_projiect_name_null, type: 'blur'} };
    } else if (!reg.test(control.value)) {
      return { res: { tiErrorMessage: this.i18n.validata.integer_rule1, type: 'blur'} };
    } else {
      return {};
    }
  }

  /**
   * tcp_wmem, tcp_rmem校验
   */
  thresholdTcpValidator = (control: FormControl) => {
    // 如123 456 789
    const reg = new RegExp(/^([1-9][0-9]*)(\s+)([1-9][0-9]*)(\s+)([1-9][0-9]*$)/);
    if (!control.value.trim()) {
      return { res: { tiErrorMessage: this.i18n.common_term_projiect_name_null, type: 'blur'} };
    } else if (!reg.test(control.value)) {
      return { res: { tiErrorMessage: this.i18n.validata.integer_rule2, type: 'blur'} };
    } else {
      return {};
    }
  }

  /**
   * 获取阈值设置的表单项
   * @param arr 阈值信息
   * @returns 阈值列表
   */
  private formatThresholdData(arr: Array<Threshold>) {
    this.thresholdForm = [];
    this.memoryFreeForm = [];
    arr.forEach((item: Threshold) => {
      let collectedValue = '';
      if (parseFloat(item.value).toString() !== 'NaN') { // 数值型
        collectedValue = item.value;
      } else {
        collectedValue = '--';
      }
      const formItem = {
        id: item.id,
        label: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? item.indicator_cn : item.indicator_en,
        indicator: item.indicator,
        expected_value: item.expected_value,
        desc: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? item.desc_cn : item.desc_en,
        value: collectedValue,
      };
      if (this.otherForm.includes(item.indicator)) {  // 系统配置
        this.memoryFreeForm.push(formItem);
      } else {
        this.thresholdForm.push(formItem);
      }
    });
  }

  public trackByItems(index: number, item: ThresholdFormItem): string {
    return item.indicator;
  }

  /**
   * 设置阈值
   */
  public async setThreshold() {
    const thresholdConfig: Config[] = this.thresholdForm.map((item: ThresholdFormItem) => {
      return {
        id: item.id,
        indicator: item.indicator,
        expected_value: this.formItemTcp.includes(item.indicator) ? item.expected_value : Number(item.expected_value),
      };
    });

    // 系统配置模块有
    const memoryFreeConfig: Config[] = this.memoryFreeForm.map((item: ThresholdFormItem) => {
      return {
        id: item.id,
        indicator: item.indicator,
        expected_value: Number(item.expected_value),
      };
    });

    const params: ThresholdParam = {
      nodeId: this.statusService.nodeId,
      config: thresholdConfig.concat(memoryFreeConfig),
    };
    try {
      const resp: RespCommon<TreeRespData<any>> = await this.http.put(
        `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/update-expected-value/`,
        params,
      );
      if (resp.code === STATUS_CODE.SUCCESS) {
        // 更新拓扑图，更新阈值详情
        const messageData: TopologyTreeMessageData = {
          optimizationType: this.optimizationType
        };
        this.taskDetailMessageService.updataTopologyTree(TopologyTreeMessageType.updateTree, messageData);
      }
    } catch (error) {
      this.tipServe.alertInfo({
        type: 'error',
        content: error.message,
        time: 3500
      });
    }
  }

  /**
   * 重置
   */
  public resetThreshold() {
    this.formatThresholdData(this.thresholdData);
  }
}
