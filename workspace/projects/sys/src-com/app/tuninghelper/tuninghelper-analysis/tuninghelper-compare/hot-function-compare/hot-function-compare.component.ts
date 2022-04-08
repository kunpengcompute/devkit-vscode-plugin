import { Component, OnInit } from '@angular/core';
import { TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { RespCommon } from 'sys/src-com/app/domain';
import { LANGUAGE_TYPE, STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { TuninghelperStatusService } from '../../service/tuninghelper-status.service';
import { I18n } from 'sys/locale';

/** 表格列数据 */
type HotFunctionCompareTableData = {
  function_name: string;
  command: string;
  command_line: string;
  module: string;
  cpu: string;
  cpu_sort: string;
  system: string;
  system_sort: string;
  user: string;
  user_sort: string;
  pid1: string;
  cpu1: string;
  system1: string;
  user1: string;
  pid2: string;
  cpu2: string;
  system2: string;
  user2: string;
};

/** 后端返回的数据类型 */
type RespHotFunctionCompareData = {
  [propName: string]: {
    pid: Array<string>;
    cpu: Array<string>;
    sys: Array<string>;
    usr: Array<string>;
  }
};
@Component({
  selector: 'app-hot-function-compare',
  templateUrl: './hot-function-compare.component.html',
  styleUrls: ['./hot-function-compare.component.scss']
})
export class HotFunctionCompareComponent implements OnInit {

  // 热点函数对比配置
  public hotFunctionCompareTableData: CommonTableData = {
    columnsTree: [] as Array<CommonTableData>,
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
    isNeedSetColumnWidth: true,
  };

  constructor(
    private http: HttpService,
    private i18nService: I18nService,
    private tuninghelperStatusService: TuninghelperStatusService,
  ) {}

  ngOnInit(): void {
    this.initTableColumns();
    this.getHotFunctionCompareData();
  }

  /**
   * 初始化表格列
   */
  private initTableColumns() {
    this.hotFunctionCompareTableData.columnsTree = [
      {
        label: I18n.tuninghelper.compare.hotFunction.functionName,
        key: 'function_name',
        checked: true,
        searchKey: 'function_name',
        disabled: true,
        width: '100px',
      },
      {
        label: 'Command',
        key: 'command',
        checked: true,
        width: '100px',
      },
      {
        label: I18n.tuninghelper.compare.hotFunction.moduleText,
        key: 'module',
        checked: true,
        width: '100px',
      },
      {
        label: I18n.tuninghelper.compare.compareValue,
        checked: true,
        expanded: true,
        width: '300px',
        widthType: 'px',
        children: [
          {
            label: '%CPU',
            width: '100px',
            key: 'cpu',
            tip: I18n.sys.tip['%cpu'],
            checked: true,
            sortKey: 'cpu_sort',
          },
          {
            label: '%system',
            width: '100px',
            key: 'system',
            tip: I18n.sys.tip['%sys'],
            checked: true,
            sortKey: 'system_sort',
          },
          {
            label: '%user',
            width: '100px',
            key: 'user',
            tip: I18n.sys.tip['%user'],
            checked: true,
            sortKey: 'user_sort',
          },
        ]
      },
      {
        label: I18n.tuninghelper.compare.object1,
        checked: true,
        expanded: true,
        widthType: 'px',
        children: [
          {
            label: 'PID',
            width: '100px',
            key: 'pid1',
            checked: true,
            searchKey: 'pid1',
          },
          {
            label: '%CPU',
            width: '100px',
            key: 'cpu1',
            tip: I18n.sys.tip['%cpu'],
            checked: true,
            sortKey: 'cpu1',
          },
          {
            label: '%system',
            width: '100px',
            key: 'system1',
            tip: I18n.sys.tip['%sys'],
            checked: true,
            sortKey: 'system1',
          },
          {
            label: '%user',
            width: '100px',
            key: 'user1',
            tip: I18n.sys.tip['%user'],
            checked: true,
            sortKey: 'user1',
          },
        ]
      },
      {
        label: I18n.tuninghelper.compare.object2,
        checked: true,
        expanded: true,
        widthType: 'px',
        children: [
          {
            label: 'PID',
            width: '100px',
            key: 'pid2',
            checked: true,
            searchKey: 'pid2',
          },
          {
            label: '%CPU',
            width: '100px',
            key: 'cpu2',
            tip: I18n.sys.tip['%cpu'],
            checked: true,
            sortKey: 'cpu2',
          },
          {
            label: '%system',
            width: '100px',
            key: 'system2',
            tip: I18n.sys.tip['%sys'],
            checked: true,
            sortKey: 'system2',
          },
          {
            label: '%user',
            width: '100px',
            key: 'user2',
            tip: I18n.sys.tip['%user'],
            checked: true,
            sortKey: 'user2',
          },
        ]
      },
    ];
  }
  /**
   * 获取热点函数对比数据
   */
  private async getHotFunctionCompareData() {
    this.clearData();
    try {
      const resp: RespCommon<RespHotFunctionCompareData> = await this.http.get(
        '/data-comparison/hot-function-comparison/', { params: { id: this.tuninghelperStatusService.taskId } });
      if (resp.code === STATUS_CODE.SUCCESS) {
        const data = resp?.data;
        if (data && JSON.stringify(data) !== '{}') {
          // 获取表格显示的数据
          this.handleTableData(data);
        }
      }
    } catch (error) {  // 请求失败
    }
  }

  /**
   * 处理表格显示的数据
   * @data 后端返回数据
   */
  private handleTableData(data: RespHotFunctionCompareData) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const keys = key.split(',');
        const getCompareValue = (arr: string[]) => {
          const str1 = arr[0];
          const str2 = arr[1];
          const retdata = '--' + this.i18nService.I18n().common_term_sign_left
        + '--' + '%' + this.i18nService.I18n().common_term_sign_right;
          // 不是数值
          if (parseFloat(str1).toString() === 'NaN' || parseFloat(str2).toString() === 'NaN') {
            return retdata;
          }

          // 百分比
          if (str1.includes('%') && str2.includes('%')) {
            if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
              return this.toDecimal2(str1, str2) + '%（' + arr[2] + '%）';
            } else {
              return this.toDecimal2(str1, str2) + '%(' + arr[2] + '%)';
            }
          } else {
            if (this.i18nService.currLang === LANGUAGE_TYPE.ZH) {
              return this.toDecimal2(str1, str2) + '（' + arr[2] + '%）';
            } else {
              return this.toDecimal2(str1, str2) + '(' + arr[2] + '%)';
            }
          }
        };
        const row: HotFunctionCompareTableData = {
          function_name: keys[0],
          module: keys[1],
          command: keys[3],
          command_line: keys[2],
          cpu: getCompareValue(data[key].cpu),
          cpu_sort: data[key].cpu[2],
          system: getCompareValue(data[key].sys),
          system_sort: data[key].sys[2],
          user: getCompareValue(data[key].usr),
          user_sort: data[key].usr[2],
          pid1: data[key].pid[0],
          cpu1: data[key].cpu[0],
          system1: data[key].sys[0],
          user1: data[key].usr[0],
          pid2: data[key].pid[1],
          cpu2: data[key].cpu[1],
          system2: data[key].sys[1],
          user2: data[key].usr[1],
        };
        this.hotFunctionCompareTableData.srcData.data.push(row);
      }
    }
    /** 重新赋值触发表格更新 */
    this.hotFunctionCompareTableData = { ...this.hotFunctionCompareTableData };
  }

  /**
   * 保留2位小数
   */
  private toDecimal2(str1: string, str2: string) {
    return (parseFloat(str1) - parseFloat(str2)).toFixed(2);
  }
  /**
   * 清空表格数据
   */
  private clearData() {
    this.hotFunctionCompareTableData.srcData.data = [];
  }
}
