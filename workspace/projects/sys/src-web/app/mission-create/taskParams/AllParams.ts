/*
 * Copyright 2022 Huawei Technologies Co., Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// --- 所有的表单参数 ---
import { ValidationErrors, ValidatorFn, AbstractControl, Validators, FormControl } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { AppInjector } from '../../app-injector';  // 公共校验【应用、应用参数、PID】
import { CustomValidatorsService } from '../../service';

// 自定义校验规则
class CustomValidators {
  // 使用正则校验
  public static regValidate(reg: any, tip: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !reg.test(control.value)) {
        return {
          res: {
            tiErrorMessage: tip,
            type: 'blur'
          }
        };
      } else {
        return null;
      }
    };
  }

  /**
   * 参数A的值跟参数B的值有大小关系
   *
   * 例一：延迟采样时长与采样时长加起来不能大于900s
   *  validTheSizeRelationship({
   *    relatedFormControlName: 'samplingTime',
   *    tip: '延迟采样时长与采样时长加起来不能大于900s',
   *    calcExpression: ([valueA, valueB]) => valueA + valueB * 1000 <= 900000,
   * });
   *
   * 例二：采样间隔应当小于或等于采样时长的1/2
   *  validTheSizeRelationship({
   *    relatedFormControlName: 'duration',
   *    tip: this.i18n.process.intervalTip,
   *    calcExpression: ([valueA, valueB]) => valueA <= valueB / 2,
   * })
   */
  public static validTheSizeRelationship({ relatedFormControlName, tip, calcExpression }: {
    relatedFormControlName?: string | string[], // 相关联的表单控件名称【必须在同一个fromGroup里面】
    tip: string,  // 错误提示信息
    calcExpression: (args: any) => boolean  // 校验表达式
  }): ValidatorFn {
    let thisControl: any;
    let relatedFormControl: any;

    return (control: AbstractControl): ValidationErrors | any => {
      if (relatedFormControlName) {
        if (!control.parent) {
          return null;
        }

        if (!thisControl) {
          thisControl = control;

          // 兼容下传递单个值，方便后续扩展
          if (!Array.isArray(relatedFormControlName)) {
            relatedFormControlName = [relatedFormControlName];
          }

          relatedFormControl = relatedFormControlName.map(formControlName => {
            const formControl = control.parent.get(formControlName);

            if (!formControl) {
              throw new Error(`matchOtherValidator(): ${formControlName} control is not found in parent group`);
            }

            return formControl;
          });

          relatedFormControl.forEach((formControl: any) => {
            formControl.valueChanges.subscribe(() => {
              thisControl.updateValueAndValidity();
            });
          });
        }
      } else {
        throw new Error('matchOtherValidator(): related control is not found');
      }

      if (!calcExpression([
        control.value,
        ...(relatedFormControl as any).map((formControl: any) => formControl.value)
      ])) {
        // 当采样间隔未touch过的时候，修改采样时长的值不会触发采样间隔的错误提示，需要标记为touched才可以
        if (!thisControl.touched) {
          thisControl.markAsTouched();
        }
        return {
          pwd: {
            tiErrorMessage: tip,
            type: 'blur'
          }
        };
      }
    };
  }
}

class AllParams {
  public allParams: any;

  constructor() {
    const i18n = new I18nService().I18n();
    const vilidatorService = AppInjector.get(CustomValidatorsService);

    this.allParams = {
      // 父级
      taskName: { // 任务名称
        label: i18n.common_term_task_name,
        required: true,
        type: 'input',
        customValidators: [CustomValidators.regValidate(new RegExp('^[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$'),
        i18n.validata.task_name_rule)],
      },
      analysisObject: { // 分析对象
        label: i18n.mission_create.analysisTarget,
        required: true,
        type: 'radio',
        lastValue: null,
        list: [
          {
            label: i18n.common_term_projiect_task_system,
            value: 'analysisObject_sys',
            tip: i18n.common_term_task_type_profile,
          }, {
            label: i18n.common_term_task_crate_app_path,
            value: 'analysisObject_app',
            tip: '',
          }
        ],
        hasOptionTip: true,
      },
      analysisMode: { // 分析模式
        label: i18n.mission_create.mode,
        required: true,
        type: 'radio',
        lastValue: null,
        list: [
          {
            label: 'Launch Application',
            value: 'app',
            tip: i18n.common_term_task_type_launch,
          }, {
            label: 'Attach to Process',
            value: 'pid',
            tip: i18n.common_term_task_type_attach,
          }
        ],
      },
      application: { // 应用
        label: i18n.common_term_task_crate_app_path,
        required: true,
        type: 'input',
        customValidators: [vilidatorService.CheckApp.bind(vilidatorService)],
      },
      applicationParams: { // 应用参数
        label: i18n.common_term_task_crate_parameters,
        required: false,
        type: 'textarea',
      },
      switchState: { // 应用运行用户 开关
        label: i18n.common_term_task_crate_app_runUser,
        required: false,
        type: 'switch',
      },
      user_name: { // 应用运行用户 用户名
        label: i18n.common_term_task_crate_app_user,
        required: false,
        type: 'input',
      },
      password: { // 应用运行用户 密码
        label: i18n.common_term_task_crate_app_passWord,
        required: false,
        type: 'password',
      },
      pid: {  // PID
        label: i18n.common_term_task_crate_pid,
        required: false,
        type: 'input',
        customValidators: [],
      },
      process_name: {  // 进程名称
        label: i18n.mission_create.process_alias,
        required: false,
        type: 'input',
        customValidators: [],
      },
      analysisType: { // 分析类型
        label: i18n.common_term_task_analysis_type,
        required: true,
        type: 'radio',
        lastValue: null,
        list: [
          { // 访存分析
            label: i18n.mission_modal.memAccessAnalysis,
            value: 'memAnalysis',
            checked: true
          },
        ],
      },

      // 访存分析
      memAnalysisMode: { // 访存分析类型
        label: i18n.ddr.accessAnalysisType,
        required: false,
        type: 'radio',
        lastValue: null,
        systemList: [
          { // 访存统计分析
            label: i18n.mission_create.mem,
            value: 'mem_access',
            iconTip: i18n.mission_create.memMsg,
            checked: true,
          }, {  // Miss事件分析
            label: i18n.mission_create.missEvent,
            value: 'miss_event',
            iconTip: i18n.mission_create.missEventMsg,
          }, {  // 伪共享分析
            label: i18n.mission_create.falsesharing,
            value: 'falsesharing',
            iconTip: i18n.mission_create.falsesharingMsg,
          }
        ],
        applicationList: [
          {  // Miss事件分析
            label: i18n.mission_create.missEvent,
            value: 'miss_event',
            iconTip: i18n.mission_create.missEventMsg,
            checked: true,
          }, {  // 伪共享分析
            label: i18n.mission_create.falsesharing,
            value: 'falsesharing',
            iconTip: i18n.mission_create.falsesharingMsg,
          }
        ],
        list: [],
      },

      // 访存统计
      /* 采样时长
        【Miss事件】自定义了默认值
        【伪共享分析】自定义了value、min、max、tip和tailPrompt
      */
      samplingTime: {
        label: i18n.ddr.label.duration,
        required: true,
        type: 'spinner',
        value: 30,
        correctable: false,
        min: 1,
        max: 300,
        step: 1,
        format: 'n0',
        tailPrompt: i18n.common_term_sign_left + '1~300' + i18n.common_term_sign_right,
      },
      /* 采样间隔(毫秒)
        【访存统计分析】自定义了校验规则
      */
      samplingInterval: {
        label: i18n.ddr.label.interval,
        required: true,
        type: 'select',
        list: [
          { label: 100, value: 100, checked: true },
          { label: '1,000', value: 1000 },
        ],
        tip: i18n.process.intervalTip,
      },
      samplingType: { // 采样类型
        label: i18n.ddr.label.type,
        required: true,
        type: 'checkbox',
        list: [
          { label: i18n.ddr.types.cache_access, value: 'cache_access', checked: true },
          { label: i18n.ddr.types.ddr_access, value: 'ddr_access', checked: true },
        ],
      },

      // Miss事件
      /* 采样间隔（指令数）
        【Miss事件】自定义了默认值
      */
      samplingInterval_instructionsNum: {
        label: i18n.ddr.samplingInterval
                + ' '
                + i18n.ddr.leftParenthesis
                + i18n.common_term_task_tab_summary_instructions
                + i18n.ddr.rightParenthesis,
        required: true,
        type: 'spinner',
        value: 1024,
        correctable: false,
        min: 1024,
        max: 2 ** 32 - 1,
        step: 1,
        format: 'n0',
        tailPrompt: i18n.common_term_sign_left + '1,024~2^32-1' + i18n.common_term_sign_right,
      },
      indicatorType: {  // 指标类型
        label: i18n.ddr.indicatorType,
        required: false,
        type: 'select',
        lastValue: null,
        list: [
          { label: 'LLC Miss', value: 'llcMiss', hoverTip: i18n.ddr.llcMiss, checked: true },
          { label: 'TLB Miss', value: 'tlbMiss', hoverTip: i18n.ddr.tlbMiss },
          { label: 'Remote Access', value: 'remoteAccess', hoverTip: i18n.ddr.remoteAccess },
          { label: 'Long Latency Load', value: 'longLatencyLoad', hoverTip: i18n.ddr.longLatencyLoad },
        ],
      },
      minimumDelay: { // 最小延时（cycles）
        label: i18n.ddr.minimumDelay
                + ' '
                + i18n.ddr.leftParenthesis
                + i18n.common_term_task_tab_summary_cycles
                + i18n.ddr.rightParenthesis,
        required: true,
        type: 'spinner',
        value: 100,
        correctable: false,
        min: 1,
        max: 4095,
        step: 1,
        format: 'n0',
        tailPrompt: i18n.common_term_sign_left + '1~4,095' + i18n.common_term_sign_right,
      },

      // Miss事件-高级参数
      expandBtn: {  // 高级参数开关【已去掉】
        label: i18n.ddr.advancedParameters,
        required: false,
        type: 'expandBtn',
        value: true,
      },
      cpuToBeSamples: { // 待采样CPU核
        label: i18n.ddr.cpuToBeSamples,
        required: false,
        type: 'input',
        iconTip: i18n.tip_msg.common_term_task_crate_mask_tip,
        customValidators: [vilidatorService.checkSampCPUMask()],
      },
      /* 采样范围
        【伪共享分析】修改了默认选中
      */
      samplingRange: {
        label: i18n.ddr.samplingRange,
        required: false,
        type: 'select',
        list: [
          { label: i18n.micarch.typeItem_all, value: 'all', checked: true },
          { label: i18n.micarch.typeItem_kernel, value: 'kernel' },
          { label: i18n.micarch.typeItem_user, value: 'user' },
        ],
        // show: () => this.allFormElements.expandBtn.value,
      },
      /* 延迟采样时长
        【伪共享分析】自定义了value
      */
      delayCollectionTime: {
        label: i18n.ddr.collectionDelay
                + ' '
                + i18n.ddr.leftParenthesis
                + i18n.common_term_task_crate_ms
                + i18n.ddr.rightParenthesis,
        required: false,
        type: 'spinner',
        value: 1000,
        correctable: false,
        min: 0,
        max: 900000,
        step: 1,
        format: 'n0',
        iconTip: i18n.micarch.simpling_delay_tip,
        tailPrompt: i18n.common_term_sign_left + '0~900,000' + i18n.common_term_sign_right,
      },
      b_s: {  // 二进制/符号文件路径【已去掉】
        label: i18n.common_term_task_crate_bs_path,
        required: false,
        type: 'input',
        customValidators: [CustomValidators.regValidate(new RegExp(/^([\/][^\/]+)*$/),
        i18n.tip_msg.common_term_file_path_error)],
        iconTip: i18n.tip_msg.common_term_task_crate_c_bs_tip
      },
      symbolFilePath: { // 符号文件路径
        label: i18n.mission_modal.lockSummary.filname,
        required: false,
        type: 'input',
        customValidators: [CustomValidators.regValidate(new RegExp(/^([\/][^\/]+)*$/),
        i18n.tip_msg.common_term_file_path_error)],
        iconTip: i18n.tip_msg.common_term_task_crate_c_bs_tip,
      },
      c_source: { // C/C++源文件路径
        label: i18n.common_term_task_crate_c_path,
        required: false,
        type: 'input',
        customValidators: [CustomValidators.regValidate(new RegExp(/^([\/][^\/]+)*$/),
        i18n.tip_msg.common_term_file_path_error)],
        iconTip: i18n.tip_msg.common_term_task_crate_c_source_tip,
        // show: () => this.allFormElements.expandBtn.value,
      },

      // 伪共享分析
      // 采集文件大小
      filesize: {
        label: i18n.falsesharing.filesize
                + ' '
                + i18n.ddr.leftParenthesis
                + 'MiB'
                + i18n.ddr.rightParenthesis,
        required: false,
        type: 'spinner',
        value: 10,
        correctable: false,
        min: 1,
        max: 1024,
        step: 1,
        format: 'n0',
        iconTip: i18n.falsesharing.filesizeTips,
        tailPrompt: i18n.common_term_sign_left + '1~1,024' + i18n.common_term_sign_right,
      },

      // 伪共享分析
      // 采集文件大小
      perfDataLimit: {
        label: i18n.falsesharing.filesize
                + ' '
                + i18n.ddr.leftParenthesis
                + 'MiB'
                + i18n.ddr.rightParenthesis,
        required: false,
        type: 'spinner',
        value: 5000,
        correctable: false,
        min: 1,
        max: 10000,
        step: 100,
        format: 'n0',
        iconTip: i18n.falsesharing.filesizeTips,
        tailPrompt: i18n.common_term_sign_left + '1~10,000' + i18n.common_term_sign_right,
      },

      // other
      kcore: { // 内核函数关联汇编指令
        label: i18n.mission_create.kcore,
        required: false,
        type: 'switch',
        value: false,
      },
    };
  }
}

export { CustomValidators, AllParams };
