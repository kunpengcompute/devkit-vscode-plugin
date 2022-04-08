import { Injectable } from '@angular/core';
import { I18nService } from 'sys/src-com/app/service';
import { LANGUAGE_TYPE } from 'sys/src-com/app/global/constant';
import * as Utils from 'projects/sys/src-com/app/util';

@Injectable()
export class CompareHandleService {
    constructor(public i18nService: I18nService) { }
    public getCompareValue(arr: string[]) {
        const str1 = arr[0];
        const str2 = arr[1];
        const retdata = '--' + this.i18nService.I18n().common_term_sign_left
        + '--' + '%' + this.i18nService.I18n().common_term_sign_right;
        if (parseFloat(str1).toString() === 'NaN' || parseFloat(str2).toString() === 'NaN') {
            return  retdata;
        }
        if (str1.toString().includes('%') && str2.toString().includes('%')) {
            if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
                return this.toDecimal2NoZero(str1, str2) + '%（' + arr[2] + '%）';
            } else {
                return this.toDecimal2NoZero(str1, str2) + '%(' + arr[2] + '%)';
            }
        } else {
            if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
                return this.toDecimal2NoZero(str1, str2) + '（' + arr[2] + '%）';
            } else {
                return this.toDecimal2NoZero(str1, str2) + '(' + arr[2] + '%)';
            }
        }
    }
    public handleCompareData(data: any) {
        const tableData: any[] = [];
        Object.keys(data).forEach((node) => {
          const object: any = {};
          object.name = node;
          Object.keys(data[node]).forEach((type) => {
            const target = data[node][type];
            object[type + '_1'] = target[0]; // 对象1
            object[type + '_2'] = target[1]; // 对象2
            object[type + '_compare'] = this.getDiffValue(target[0], target[1]); // 对比值
            object[type + '_percent'] = object[type + '_compare'] + this.i18nService.I18n().common_term_sign_left
                                        + target[2] + '%' + this.i18nService.I18n().common_term_sign_right;
          });
          tableData.push(object);
        });
        return tableData;
    }
    /**
     * 保留2位小数
     */
     private toDecimal2NoZero(str1: string, str2: string) {
        return Utils.setThousandSeparator((parseFloat(str1) - parseFloat(str2)).toFixed(2));
    }
    /**
     * 计算对比值
     */
    public getDiffValue(num1: any, num2: any) {
        if (parseFloat(num1).toString() === 'NaN' || parseFloat(num2).toString() === 'NaN') {
            return '--';
        } else {
            return (num1 - num2).toFixed(2);
        }
    }
}
