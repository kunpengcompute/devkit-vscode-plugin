import { I18nService } from 'sys/src-com/app/service';
export class ComputerComparisonValueService {
  constructor() {
   }

  /**
   * 计算对比值=对象1-对象2
   * @param value1 对象1值
   * @param value2 对象2值
   * @returns 对比值
   */
  public static getComparisonValue(data: Array<any>) {
    const i18nService = new I18nService();
    const returndata = '--' + i18nService.I18n().common_term_sign_left
    + '--' + '%' + i18nService.I18n().common_term_sign_right;

    if (data.length !== 3) {
      return returndata;
    }
    const value1 = data[0];
    const value2 = data[1];
    const value3 = data[2];
    if (value1 === '--' || value2 === '--' || value3 === '--' ||
    value1 === '__' || value2 === '__' || value3 === '__') {
      return returndata;
    } else {
      return `${(parseFloat(value1) - parseFloat(value2)).toFixed(2)}(${value3}%)`;
    }
  }
}
