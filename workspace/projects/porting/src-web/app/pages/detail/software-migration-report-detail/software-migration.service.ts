import { Injectable } from '@angular/core';

import { I18nService } from '../../../service/i18n.service';
import { getExplore } from '../../../utils';

@Injectable({
  providedIn: 'root'
})
export class SoftwareMigrationService {

  constructor(
    private i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public currLang = sessionStorage.getItem('language'); // 当前语言环境

  // 对返回的报告数据进行处理
  handleReportDate(data: any) {
    const textForm1 = {
      firstItem: {
        label: this.i18n.common_term_ipt_label.packageName,
        value: [] as Array<any>
      },
      fifthItem: {
        label: this.i18n.common_term_ipt_label.target_os,
        value: ''
      },
      sixthItem: {
        label: this.i18n.common_term_ipt_label.target_system_kernel_version,
        value: ''
      },
      seventhItem: {
        label: this.i18n.common_term_ipt_label.pathName,
        value: [] as Array<any>
      }
    };

    // 软件安装包存放路径
    data.installation_package_path.path.forEach((path: any) => {
      textForm1.firstItem.value.push(path);
    });
    // x86上已安装软件路径
    data.software_installation_path.path.forEach((path: any) => {
      textForm1.seventhItem.value.push(path);
    });
    textForm1.fifthItem.value = data.target_os === 'centos7.6' ? 'CentOS 7.6' : data.target_os;
    textForm1.sixthItem.value = data.target_system_kernel_version;

    const obj: any = {};
    let soFilesTotal = 0;
    let soFilesNeed = 0;
    let soFilesUse = 0;
    const list: Array<any> = [];
    data.dependency_packages.forEach((dep: any) => {
      for (const key in dep.porting_level) {
        if (dep.porting_level[key].amount) {
          // 对数据进行合并处理
          if (!obj[key]) {
            obj[key] = dep.porting_level[key];
          } else {
            obj[key].amount += dep.porting_level[key].amount;
            obj[key].bin_detail_info = obj[key].bin_detail_info.concat(
              dep.porting_level[key].bin_detail_info
            );
          }
        }
      }
    });

    let arr: Array<any> = [];  // 保存所有的bin_detail_info文件
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        soFilesTotal += obj[key].amount; // 依赖文件总数
        if (Number(key) === 2 || Number(key) === 5) {
          soFilesNeed += obj[key].amount; // 待验证替换
        }
        soFilesUse =  soFilesTotal - soFilesNeed;

        obj[key].bin_detail_info.forEach((item: any) => {
          item.level = String(key);
        });
        arr = arr.concat(obj[key].bin_detail_info);
      }
    }

    arr.forEach((item, index) => {
        item.type = this.formatSoType(item.type);
        const pathDesc = this.currLang === 'zh-cn'
          ? `无，该${item.type}是从当前软件包中获取的依赖信息`
          : `No path available. The ${item.type} is a dependency obtained from the current software package`;
        let isHTTP = false;
        if (item.url) {
          // 判断是否为 chrome版本
          isHTTP = getExplore() && (item.url.split('://')[0].toLowerCase() === 'http');
        }
        let isAarch64 = false;
        if (item.hasOwnProperty('is_aarch64')) {
          isAarch64 = item.is_aarch64;
        }
        list.push({
            number: index + 1,
            name: item.libname,
            type: item.type,
            path: item.path || pathDesc,
            urlName: item.url ? this.handelDownloadUrl(item.url) : '--',
            oper: this.formatSoSuggestion(item.level),
            result: this.formatSoResult(item.level),
            url: item.url,
            path_ext: item.path_ext,
            so_info: item.so_info,
            isHTTP,
            isAarch64,
            showSub: false, // 是否显示子内容
            isClick: false, // 是否点击了 复制链接
            level: item.level
        });
    });
    list.forEach((item: any) => {
        if (!item.url) {  // jar包没有下载链接
            if (item.so_info && item.so_info.length) {  // 有子路径
                const soInfo = [];

                // 查看子路径是否有下载链接
                for (const [pathName, pathUrl] of item.so_info) {
                    if (pathUrl) {
                        item.soFileHasUrl = true;  // 存在.so文件有下载链接或返回包名
                        break;
                    }
                }
                for (const [pathName, pathUrl] of item.so_info) {
                    let isHTTP = false;
                    if (pathUrl) {
                      // 判断是否为 chrome版本
                      isHTTP = getExplore() && (pathUrl.split('://')[0].toLowerCase() === 'http');
                    }
                    let soObj: {
                        path: string  // 路径
                        urlName: string,  // 待下载的软件包名称
                        oper: string,  // 分析结果
                        result: string,  // 处理建议
                        url: string,  // 下载url
                        isHTTP?: boolean
                    };
                    if (pathUrl) {  // 子路径有下载链接或返回包名
                        if (pathUrl.includes('http')) {  // 是下载链接
                            soObj = {
                                path: pathName,
                                urlName: this.handelDownloadUrl(pathUrl),
                                oper: this.formatSoSuggestion('0'),
                                result: this.formatSoResult('0'),
                                url: pathUrl,
                                isHTTP,
                            };
                        } else {  // 返回的包名
                            soObj = {
                                path: pathName,
                                urlName: pathUrl,
                                oper: this.formatSoSuggestion(item.level),
                                result: '--',
                                url: '',
                                isHTTP
                            };
                        }
                    } else {  // 子路径没有下载链接或没有返回包名
                        soObj = {
                            path: pathName,
                            urlName: '--',
                            oper: this.formatSoSuggestion(item.level),
                            result: this.formatSoResult(item.level),
                            url: '',
                            isHTTP
                        };
                    }
                    soInfo.push(soObj);
                }
                item.soInfoList = soInfo;  // 子路径数组对象
            }
        } else {  // jar包有下载链接
            if (item.path_ext.length) {  // 有子路径
                const pathList: any[] = [];
                item.path_ext.forEach((path: string) => {
                    pathList.push({
                        path
                    });
                });
                item.soInfoList = pathList;
            }
        }
    });
    return {
      textForm1,
      soFilesTotal,
      soFilesNeed,
      soFilesUse,
      list: this.linePortingLevel(list)
    };
  }

  /**
   * 对表格进行行合并处理
   * @param list 表格数据
   */
  linePortingLevel(list: Array<any>): Array<any> {
    let rowSpan = 1;
    list[0] = Object.assign(list[0], { rowSpan, showTd: true });
    list.reduce((pre, cur) => {
        if (pre.url === cur.url && pre.oper === cur.oper && pre.result === cur.result
        && !pre.soFileHasUrl && !cur.soFileHasUrl) {
            rowSpan++;
            pre = Object.assign(pre, { rowSpan, showTd: true });
            cur = Object.assign(cur, { rowSpan: 1, showTd: false });
            return pre;
        } else {
            rowSpan = 1;
            cur = Object.assign(cur, { rowSpan, showTd: true });
            return cur;
        }
    });
    return list;
  }

  /**
   * 对表格jar子路径进行行合并处理
   * @param list 表格jar子路径数据
   * @param cols 需要合并的项
   */
  mergeSoInfoList(list: Array<any>, cols: Array<string>): Array<any> {
    list.forEach(item => {
        item.mergeRowSpan = {};  // 保存合并项合并的行数
        item.showTd = {};  // 合并的字段是否显示
    });
    cols.forEach(key => {
        let rowSpan = 1;
        list[0].mergeRowSpan[key] = 1;
        list[0].showTd[key] = true;
        list.reduce((pre, cur) => {
            if (key === 'result') {
                if (pre.urlName === cur.urlName) {  // 包名相同，则进行合并
                    rowSpan++;
                    pre.mergeRowSpan[key] = rowSpan;
                    pre.showTd[key] = true;
                    cur.mergeRowSpan[key] = 1;
                    cur.showTd[key] = false;
                    return pre;
                } else {
                    rowSpan = 1;
                    cur.mergeRowSpan[key] = rowSpan;
                    cur.showTd[key] = true;
                    return cur;
                }
            } else {
                if (pre[key] === cur[key]) {  // 合并key相同的项
                    rowSpan++;
                    pre.mergeRowSpan[key] = rowSpan;
                    pre.showTd[key] = true;
                    cur.mergeRowSpan[key] = 1;
                    cur.showTd[key] = false;
                    return pre;
                } else {
                    rowSpan = 1;
                    cur.mergeRowSpan[key] = rowSpan;
                    cur.showTd[key] = true;
                    return cur;
                }
            }
        });
    });
    return list;
  }

  /**
   * 处理文件类型
   * @param type 类型
   */
  formatSoType(type: string): string {
    switch (type) {
      case 'DYNAMIC_LIBRARY':
        return this.i18n.common_term_report_type.dynamic_library;
      case 'STATIC_LIBRARY':
        return this.i18n.common_term_report_type.static_library;
      case 'EXEC':
        return this.i18n.common_term_report_type.exec;
      case 'JAR':
        return this.i18n.common_term_report_type.jar;
      case 'SOFTWARE':
        return this.i18n.common_term_report_type.software;
      default:
        return '';
    }
  }

  // 对下载url进行切割
  handelDownloadUrl(url: string): string {
    if (url.lastIndexOf('/') > -1) {
      const lastIndex = url.lastIndexOf('/');
      return url.slice(lastIndex + 1);
    } else {  // url为包名
      return url;
    }
  }

  /**
   * 分析结果
   * @param level 类型
   */
  formatSoSuggestion(level: string): string {
    switch (level) {
      case '0':
        return this.i18n.common_term_report_level0_desc;
      case '1':
        return this.i18n.common_term_report_level1_desc;
      case '2':
        return this.i18n.common_term_report_level2_desc;
      case '3':
        return this.i18n.common_term_report_level3_desc;
      case '4':
        return this.i18n.common_term_report_level4_desc;
      case '5':
        return this.i18n.common_term_report_level5_desc;
      case '6':
        return this.i18n.common_term_report_level6_desc;
      default:
        return '';
    }
  }

  /**
   * 处理建议
   * @param level 类型
   */
  formatSoResult(level: string): string {
    switch (level) {
      case '0':
        return this.i18n.common_term_report_level0_result;
      case '1':
        return this.i18n.common_term_report_level1_result;
      case '2':
        return this.i18n.common_term_report_level2_result;
      case '3':
        return this.i18n.common_term_report_level3_result;
      case '4':
        return this.i18n.common_term_report_level4_result;
      case '5':
        return this.i18n.common_term_report_level5_result;
      case '6':
        return this.i18n.common_term_report_level6_result;
      default:
        return '';
    }
  }
}
