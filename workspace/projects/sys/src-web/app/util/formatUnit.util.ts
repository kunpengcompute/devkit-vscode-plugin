/**
 * 格式化时间单位，例：1200ms使用1.2s显示
 * @param value value
 * @param unit value 使用的单位
 */
export function formatTimeUnit(value: number, unit: 'us' | 'ms' | 's'): string {
  if (+value === 0) {
    return `0 ${unit}`;
  }

  const unitList = [
    { label: 'us', prop: 'us' },
    { label: 'ms', prop: 'ms' },
    { label: 's', prop: 's' },
  ];
  const valueWithUsUnit = value * (1000 ** unitList.findIndex(item => item.prop === unit));
  const offset = Math.floor(Math.log(valueWithUsUnit) / Math.log(1000));
  return `${(valueWithUsUnit / Math.pow(1000, offset)).toFixed(2)} ${unitList[offset].label}`;
}

/**
 * 格式化文件大小单位，例：1024M => 1G
 * @param value 文件大小
 * @param unit value 使用的单位
 * @param decimalNum 小数位数
 */
export function formatFileSizeUnit(value: number, unit: 'B' | 'KB' | 'MB' | 'GB', decimalNum?: any ): string {
  if (+value === 0) {
    return `0 ${unit}`;
  }

  const unitList = [
    { label: 'B', prop: 'B', rate: 1 },
    { label: 'KB', prop: 'KB', rate: 1024 },
    { label: 'MB', prop: 'MB', rate: 1024 * 1024 },
    { label: 'GB', prop: 'GB', rate: 1024 * 1024 * 1024 },
  ];
  const baseValue = value * unitList.find(item => item.prop === unit).rate;
  let usedUnit;
  for (let index = 0; index < unitList.length; index++) {
    const rate = unitList[index].rate;
    const nextRate = unitList[index + 1] ? unitList[index + 1].rate : Infinity;
    if ((baseValue >= rate) && (baseValue < nextRate)) {
      usedUnit = unitList[index];
      break;
    }
  }
  return `${decimalNum === undefined
    ? (baseValue / usedUnit.rate) : (baseValue / usedUnit.rate).toFixed(2)} ${usedUnit.label}`;
}


  /**
   * 日期格式化函数
   * @param date 被格式化日期
   * @param fmt 格式化日期的格式
   */
export function dateFormat(date: string | number | Date, fmt: string) {
    const getDate = new Date(date);
    const o: any = {
      'M+': getDate.getMonth() + 1,
      'd+': getDate.getDate(),
      'h+': getDate.getHours(),
      'm+': getDate.getMinutes(),
      's+': getDate.getSeconds(),
      'q+': Math.floor((getDate.getMonth() + 3) / 3),
      S: getDate.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (getDate.getFullYear() + '').substring(4 - RegExp.$1.length));
    }
    for (const k of Object.keys(o)) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substring(('' + o[k]).length)));
      }
    }
    return fmt;
  }
