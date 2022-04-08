import { Component, OnInit, Input, ElementRef, HostListener, AfterViewInit, AfterViewChecked } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { TableService } from 'sys/src-com/app/service/table.service';

@Component({
  selector: 'app-micarch-summury',
  templateUrl: './micarch-summury.component.html',
  styleUrls: ['./micarch-summury.component.scss']
})
export class MicarchSummuryComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() isActive: any;
  @Input() app: any;

  public titleData: any;
  public chartNotShow = false;  // 判断空状态
  public i18n: any;
  public isTable = false;
  public instructions: any;
  public cycles: any;
  public ipc: any;
  public icicleData: any;

  // 表格
  public summaryData: any = [{
    name: 'Pipeline Slots',
    proportion: 100,
    levelIndex: 0,
    expand: true,
    children: []
  }];
  public noDataInfo = '';
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: any;
  public columns: Array<TiTableColumns> = [];
  public obtainingSummaryData = false;

  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService,
    private el: ElementRef,
    private messageService: MessageService,
    public tableService: TableService
  ) {
    this.i18n = this.i18nService.I18n();
    this.columns = [
      { title: this.i18n.micarch.eventName, prop: 'name' },
      { title: this.i18n.micarch.percentage, prop: 'proportion', sortKey: 'proportion', sortStatus: '' },
    ];
    this.srcData = {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: true, // 使用自己的排序
        paginated: false // 源数据未进行分页处理
      },
    };
  }

  ngAfterViewInit(): void { }

  ngAfterViewChecked(): void { }

  ngOnInit() {
    this.getSummaryData();
  }

  public isNaN(value: any) {
    return isNaN(value);
  }

  // 获取总览数据【好像表格和图都是一样的数据，需要改请看下表格是否要动】
  public getSummaryData() {
    this.noDataInfo = this.i18n.loading;
    const params = {
      nodeId: this.nodeid
    };
    this.obtainingSummaryData = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/microarchitecture/summary/`, {
      params,
      headers: {
        showLoading: false,
      },
    }).then((data: any) => {
      const summaryData: any = data.data.summary.data;
      this.instructions = summaryData.Instructions || '--';
      this.cycles = summaryData.Cycles || '--';
      this.ipc = summaryData.Ipc || '--';
      // 判断是否有数据
      if (summaryData != null && Object.prototype.hasOwnProperty.call(summaryData, 'Top')
        && (Object.keys(summaryData.Top).length > 0)) {
        // 为空情况有： ummaryData.Top 中的各个属性的值都为空或者为 0
        const isNone: boolean = Object.keys(summaryData.Top).every(el => {
          const item = summaryData.Top[el];
          return item == null || item === 0;
        });
        if (isNone === true) {
          this.noDataInfo = this.i18n.common_term_task_nodata2;
          this.chartNotShow = true;
        } else {
          this.chartNotShow = false;
        }
      } else {
        this.noDataInfo = this.i18n.common_term_task_nodata2;
        this.chartNotShow = true;
        this.noDataInfo = this.i18n.common_term_task_nodata;
      }

      // 【frontEndBound】=>【Front End Bound】，以对应建议列表字段
      function calcTitleKey(label: any) {
        const str = label[0].toUpperCase() + label.slice(1);
        const res: any = [];
        let word = '';
        str.split('').forEach((item: any, index: any) => {
          const code = item.charCodeAt();
          if (index === str.length - 1) {
            word += item;
            res.push(word);
          } else if (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0)) {
            if (word) {
              res.push(word);
            }
            word = item;
          } else {
            word += item;
          }
        });
        return res.join(' ');
      }

      // 将数据转换成统一格式
      // 将 backEndBound 的指标回填回去，保持格式统一
      ['memoryBound', 'coreBound', 'resourceBound'].forEach(item => {
        if (summaryData[item]) {
          if (Object.prototype.toString.call(summaryData.backEndBound) !== '[object Object]') {
            summaryData.backEndBound = {};
          }

          summaryData.backEndBound[item] = summaryData[item];
        }
      });

      const topData = summaryData.Top;
      Object.keys(topData).forEach(key => {
        if (summaryData[key]) {
          const value = topData[key];
          topData[key] = summaryData[key];
          topData[key].parent = value;
        }
      });

      const optimizationSuggestions = this.i18n.optimizationSuggestions;
      const suggestions = this.i18n.micarch.suggestions;

      // 遍历 data 生成 summaryData
      function formatChild({ children, levelIndex, childrenData }: any) {
        let maxIndex = 0;
        let maxProportion = 0;

        Object.keys(childrenData).forEach((key, index) => {
          const value = childrenData[key];
          const child: any = {
            name: key,
            proportion: value,
            levelIndex,
            expand: false,
            index,
          };

          if (Object.prototype.toString.call(value) === '[object Object]') {
            child.proportion = value.parent;
            delete value.parent;

            if (Object.keys(value).length) {
              child.children = [];
              formatChild({
                children: child.children,
                levelIndex: levelIndex + 1,
                childrenData: value,
              });
            }
          }

          if (child.proportion > maxProportion) {
            maxProportion = child.proportion;
            maxIndex = index;
          }

          const label = calcTitleKey(child.name);
          if (optimizationSuggestions[label]) {
            child.suggestions = optimizationSuggestions[label];
            child.suggestions.title = suggestions.title.format(label, child.proportion);
          }

          children.push(child);
        });

        if (children[maxIndex]) {
          children[maxIndex].max = true;
        }
      }

      formatChild({
        children: this.summaryData[0].children,
        levelIndex: this.summaryData[0].levelIndex + 1,
        childrenData: topData
      });
      this.icicleData = JSON.parse(JSON.stringify(this.summaryData[0]));

      this.srcData.data = this.tableService.getTreeTableArr(this.summaryData);
    }).catch((error: any) => {}).finally(() => {
      this.obtainingSummaryData = false;
    });
  }

  // -- 表格 --
  // 树表展开
  public toggle(node: any) {
    node.expand = !node.expand;
    this.srcData.data = this.tableService.getTreeTableArr(this.summaryData);
  }

  // 表格排序
  public doSort(prop: any, order: any) {
    this.tableService.sortTable(this.summaryData, this.columns, prop, order);
    this.srcData.data = this.tableService.getTreeTableArr(this.summaryData);
  }
}
