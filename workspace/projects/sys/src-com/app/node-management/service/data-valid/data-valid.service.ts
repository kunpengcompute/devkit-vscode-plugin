import { Injectable } from '@angular/core';
import { StateController, DispatchInfo, StateBaseOpreation } from '../../model';
import { BatchNodeInfo, BatchOptEvent, BatchOptType } from '../../domain';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { BatchNodeErrorInfo } from '../../domain/batch-node-info.type';
import { BehaviorSubject, Subject } from 'rxjs';
import { DeleteValidConfigService } from './delete-valid-config.service';
import { ImportValidConfigService } from './import-valid-config.service';

@Injectable({
  providedIn: 'root',
})
export class DataValidService implements StateBaseOpreation {
  batchOptType: BatchOptType;
  inited = new BehaviorSubject<StateController>(null);
  dispatch = new Subject<DispatchInfo>();

  constructor(
    private deleteConfigServe: DeleteValidConfigService,
    private importConfigServe: ImportValidConfigService
  ) {
    this.inited.next({
      action: (payLoad: BatchNodeInfo[]) => {
        switch (this.batchOptType) {
          case BatchOptType.Import: {
            const { base, crossover } = this.importConfigServe.getValidConfig();
            this.validBatchNodeInfo(payLoad, new FormGroup(base, crossover));
            break;
          }
          case BatchOptType.Delete: {
            const { base, crossover } = this.deleteConfigServe.getValidConfig();
            this.validBatchNodeInfo(payLoad, new FormGroup(base, crossover));
            break;
          }
          default:
            break;
        }
      },
      dismiss: () => {},
    });
  }

  /**
   * 验证批量节点的信息， 并处理派发事件
   * @param infoList 批量节点的信息
   */
  private validBatchNodeInfo(infoList: BatchNodeInfo[], validFg: FormGroup) {
    // 获取错误信息
    const errorInfoList: BatchNodeErrorInfo[] = infoList.map(
      (info: BatchNodeInfo) => {
        validFg.reset();
        validFg.patchValue(info);
        const ctls = validFg.controls;
        // 获取所有控件的错误信息
        const ctlsError = this.getControlsError(ctls);
        // 获取整体表单的错误信息
        const fgError = validFg.errors ?? [];
        // merge 所有的错误信息
        const allError = this.mergeErrors(ctlsError, fgError);

        return allError;
      }
    );

    // 判断整体的错误情况
    const isAllValid = errorInfoList.every((errorInfo) => {
      return Object.values(errorInfo).every((info) => {
        return null == info.error;
      });
    });

    // 处理派发逻辑
    if (isAllValid) {
      this.dispatch.next({ event: BatchOptEvent.Success, payLoad: infoList });
    } else {
      this.dispatch.next({
        event: BatchOptEvent.Fail,
        payLoad: errorInfoList,
      });
    }
  }

  /**
   * 获取控件的错误信息
   * @param ctls 控件
   * @returns BatchNodeErrorInfo
   */
  private getControlsError(ctls: {
    [key: string]: AbstractControl;
  }): BatchNodeErrorInfo {
    const errorInfo = Object.keys(ctls).reduce((errObj, key) => {
      const errors = ctls[key]?.errors;
      errObj[key] = {
        error: errors ? Object.values(errors) : errors,
        value: ctls[key]?.value,
      };
      return errObj;
    }, {} as any);

    return errorInfo;
  }

  /**
   * 合并 控件错误信息 和 表单错误信息
   * @param ctlsError 控件错误信息
   * @param fgError 表单错误信息
   * @returns 合并后的错误信息
   */
  private mergeErrors(
    ctlsError: BatchNodeErrorInfo,
    fgError: ValidationErrors
  ) {
    const allErrors: BatchNodeErrorInfo = {} as any;
    Object.keys(ctlsError).forEach((key) => {
      const ctlsErrObj = JSON.parse(JSON.stringify((ctlsError as any)[key]));
      (allErrors as any)[key] = ctlsErrObj;
      const fgErrArr = fgError?.[key];
      if (fgErrArr) {
        (allErrors as any)[key].error = ((ctlsErrObj.error ?? []) as []).concat(
          fgErrArr
        );
      }
    });

    return allErrors;
  }
}
