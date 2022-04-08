import { Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import * as Util from 'projects/sys/src-web/app/util';


@Component({
  selector: 'app-micarch-timing',
  templateUrl: './micarch-timing.component.html',
  styleUrls: ['./micarch-timing.component.scss']
})
export class MicarchTimingComponent implements OnInit, AfterViewInit {

  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() isActive: any;
  @Output() datatype = new EventEmitter();
  @Input() typeDetail: any;
  @Output() type = new EventEmitter();
  @Output() typeName = new EventEmitter();
  public doc: any = document;
  public isIE = /*@cc_on!@*/false || !!this.doc.documentMode;
  public childrenData: any;   // 子数据
  public isDetailVisible = false;
  public timingData: any;
  public timingChildData: any;
  public routeData: any = [];
  public color = ['#94b1ff', '#beceec ', '#798abe ', '#4b61a2', '#354477']; // 第二层数据，为了颜色对应上。要传到子组件
  public colorData = ['#94b1ff', '#beceec ', '#798abe ', '#4b61a2', '#354477'];
  public firstColor: any = []; // 第一层颜色，要传给子组件，为了颜色对应上
  public secondColor: any = [];
  public childList: any = [];
  public dataType: 'cpu';
  public timeLine: any = [];
  public dataALL: any;
  public colorType: any;   // 保留渲染的数据，用于颜色筛选
  public noDataInfo = '';
  public listsData: Array<any> = [{
    id: '',
    title: 'Retiring',
    color: '#94b1ff',
    checked: true
  }, {
    id: '',
    title: 'Front-End Bound',
    color: '#beceec',
    checked: true
  }, {
    id: '',
    title: 'Bad Speculation',
    color: '#798abe ',
    checked: true
  }, {
    id: '',
    title: 'Back-End Bound',
    color: '#4b61a2',
    checked: true
  }
  ];
  public lists: Array<any> = [];
  public upperData: any = [];
  public resize: any = {};
  public i18n: any;
  public typeSelected: any = 'cpu';
  public cpuSelected: any[];
  public typeOptions: Array<any> = [];
  public cpuNumsOption: Array<any> = [];
  public noDataShow = true;
  public dataTitle = {
    Timestamp: 0,
    Cycles: 1,
    Instructions: 2,
    Ipc: 3,
    Retiring: 4,
    'Front-End Bound': {
      parent: 5,
      'Fetch Latency Bound': {
        parent: 6,
        'ITLB Miss': {
          parent: 7,
          'L1 TLB': 8,
          'L2 TLB': 9,
        },
        'ICache Miss': {
          parent: 10,
          'L1 Cache': 11,
          'L2 Cache': 12,
        },
        'Branch Mispredict Flush': 13,
        'OOO Flush': 14,
        'Static Predictor Flush': 15,
      },
      'Fetch Bandwidth Bound': 16,
    },
    'Bad Speculation': {
      parent: 17,
      'Branch Mispredict': {
        parent: 18,
        'Indirect Branch': 19,
        'Push Branch': 20,
        'Pop Branch': 21,
        'Other Branch': 22
      },
      'Machine Clear': {
        parent: 23,
        'Nuke Flush': 24,
        'Other Flush': 25
      },
    },
    'Back-End Bound': {
      parent: 26,
      'Core Bound': {
        parent: 27,
        'Divider Stall': 28,
        'FSU Stall': 29,
        'Exe Ports Stall': 30,
      },
      'Memory Bound ': {
        parent: 31,
        'L1 Bound': 32,
        'L2 Bound': 33,
        'Ext Memory Bound': 34,
        'Store Bound': 35
      },
      'Resource Bound ': {
        parent: 36,
        'Sync Stall': 37,
        'Reorder Buffer Stall': 38,
        'Save Queue Stall': 39,
        'PC Buffer Stall': 40,
        'Physical Tag Stall': {
          parent: 41,
          'CC Physical Tag Stall': 42,
          'VFP PhysicalTagStall': 43,
          'INT PhysicalTagStall': 44
        }
      }
    }
  };

  public show = false;
  public rightData = -1;
  public leftData = 0;
  public lestShow = false;
  public boxShow = false;
  public showWidth = -1;
  public start = 0;
  public endData = -1;
  public obtainingMicarchData = false;

  // 外部 x 轴的相关参数
  public extrapositionOption: {
    domain: [number, number],
    format: (d: number) => string
  };
  public timingChartHotDomain: [number, number];

  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    private axios: AxiosService,
    public mytip: MytipService,
    private el: ElementRef) {
    this.i18n = this.i18nService.I18n();
    this.noDataInfo = this.i18n.common_term_task_nodata;
  }

  /**
   * 数据类型的具体数据名称
   */
  OnChanges(): void {

  }
  ngOnInit() {
    this.noDataInfo = this.i18n.loading;
    this.typeOptions = [
      { // 进程
        label: this.i18n.common_term_projiect_task_process,
        id: 'pid',
      },
      { // 线程
        label: this.i18n.common_term_task_tab_summary_thread,
        id: 'tid',
      },
      { // 模块
        label: this.i18n.common_term_task_tab_summary_module,
        id: 'module',
      },
      {
        label: 'CPU',
        id: 'cpu',
      },
    ];
    this.lists.forEach((item, index) => {
      item.id = this.axios.generateConversationId(15);
    });
    this.typeSelected = this.typeOptions[3];
    this.dataType = 'cpu';

    this.getMicarchData();
  }
  ngAfterViewInit() {
  }

  //  获取时序图数据
  public getMicarchData() {
    const params = {
      nodeId: this.nodeid,
      metric: this.dataType,
      range: 'entire',
      dataCount: '100'
    };

    this.obtainingMicarchData = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/microarchitecture/time-data/`, {
      params,
      headers: {
        showLoading: false,
      }
    }).then((data: any) => {
      const content = data.data['time-data'].content;  // 数据
      if (content && Object.keys(content).length > 0) {
        const selectArr: any = [{ id: 'all', label: 'ALL', select: true }];
        const cpuSelected: any = [{ id: 'all', label: 'ALL' }];
        // 遍历顺序会改变
        Object.keys(content).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(content, key)) {
            const selectObj = { id: '', label: '' };  // 下拉
            selectObj.id = key.split(':')[1];
            selectObj.label = key.split(':')[1];
            selectArr.push(selectObj);
            cpuSelected.push(selectObj);
          }
        });
        selectArr.sort((a: any, b: any) => {
          return a.label - b.label;
        });
        this.cpuNumsOption = selectArr;
        this.cpuSelected = [].concat(selectArr);
        this.noDataShow = false;
      } else {                                      // 没有数据时，详细下拉框，默认选项全部清空
        this.cpuNumsOption = [];
        this.cpuSelected = [];
        this.noDataShow = true;
      }
      const dataAll: any = this.timingDataFormat(this.dataTitle, data.data['time-data'].content);  // 处理数据
      if (dataAll.length > 0) {
        // 改变 columns 的内容，选择要渲染的内容
        dataAll.forEach((item: any, index: any) => {
          const arr = item.value.columns.slice(0, 1);
          const arrData = item.value.columns.slice(4, item.value.columns.length);
          item.value.columns = arr.concat(arrData);
          item.type = item.name.split(':')[0];   // 在子组件判断现在是cpu还是什么
          item.name = item.name.split(':')[1];
        });
        // 排序
        dataAll.sort((a: any, b: any) => {
          return a.name - b.name;
        });
        this.firstColor = this.colorData;
        this.colorType = dataAll[0].value.columns;
        // 保存渲染的数据title
        this.listsData.forEach((item, index) => {
          item.title = this.colorType[index + 1];
          item.color = this.colorData[index];
        });
        this.lists = this.listsData;
      } else {
        this.lists = [];  // 为空时，颜色筛选也应为空
        this.noDataInfo = this.i18n.common_term_task_nodata;
      }
      // 传到子组件的数据
      this.timingData = dataAll;
      // 保留原始数据
      this.dataALL = dataAll;
      this.setExtrapositionOption(this.dataALL);
    }).catch((error: any) => {}).finally(() => {
      this.obtainingMicarchData = false;
    });
  }

  dataShow(data: any) {
    const arr = [];
    if (data.length >= 15) {
      for (let i = 1; i <= 15; i++) {
        let index = Math.floor((data.length / 15) * i);
        if (index === data.length) {
          index = index - 1;
        }
        arr.push(data[index - 1]);
      }
    } else {
      data.forEach((element: any, index: any) => {
        if (index === 0 || index === data.length - 1) {
        } else {
          arr.push(element);
        }
      });
    }
    this.timeLine = arr;
  }

  // 处理数据的方法
  public timingDataFormat(title: any, cont: any) {
    function initDataDict(tit: any) {
      const vessel: any = [];
      recursive(tit, vessel);
      function recursive(data: any, vess: any) {
        if (data != null) {
          Object.keys(data).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              const value = data[key];
              if (key === 'parent') {
              } else if (typeof value === 'object') {
                const tmpObj: any = {
                  name: key,
                  dataIndex: value.parent,
                  children: [
                    vess[0],
                  ],
                };
                vess.push(tmpObj);
                recursive(value, tmpObj.children);
              } else {
                const tmpObj: any = {
                  name: key,
                  dataIndex: value,
                  children: []
                };
                vess.push(tmpObj);
              }
            }
          });
        }
      }
      return vessel;
    }

    const dicts = initDataDict(title);

    function initData(content: any, dict: any) {
      if (!content || !dict) {
        return null;
      }
      if (content.toString() === '{}' || dict.toString() === '[]') {
        return [];
      }
      const datas: any = [];
      Object.keys(content).forEach(item => {
        if (Object.prototype.hasOwnProperty.call(content, item)) {
          // 初始化数据结构
          const obj: any = {
            name: item,
            value: []
          };
          // 装载数据
          const rowData = content[item]; // 原始数据
          for (const j of rowData) {
            const rowItem = j;
            const tmpObj: any = {};
            for (const i of dict) {
              const dictObj = i;
              tmpObj[dictObj.name] = rowItem[dictObj.dataIndex];
            }
            obj.value.push(tmpObj);
          }

          // 设置 columns 和 cd
          obj.value.columns = [];
          for (const i of dict) {
            const dictObj = i;
            obj.value.columns.push(dictObj.name);
          }
          const fn = (key: any) => {
            let dictChildren = [];
            for (const i of dict) {
              const dictObj = i;
              if (dictObj.name.toString().trim() === key.toString().trim()) {
                dictChildren = dictObj.children;
              }
            }
            const data = initData(content, dictChildren);
            let dataObj = null;
            for (const n of data) {
              if (n.name === item) {
                dataObj = n;
              }
            }
            return { data: dataObj, path: key };
          };
          obj.cd = fn;
          datas.push(obj);
        }
      });
      return datas;
    }
    const res = initData(cont, dicts);
    return res;
  }

  // 下拉选择
  public typeChange(event: any) {
    this.dataType = event.id;
    this.getMicarchData();
    this.isDetailVisible = false;
    this.firstColor = this.colorData;  // 筛选类型时，把颜色初始化传过去
    this.lists.forEach((item) => {   // 所有颜色都选上
      item.checked = true;
    });
    this.upperData = [];
    this.routeData = [];
  }

  // 筛选每条
  public cpuChange(event: any) {
    if (event.length !== 0) {
      if (event[event.length - 1].id === 'all') {
        event.unshift(event.pop());
      }
      if (event[0].id === 'all') {    // 判断全选按钮是否选中
        if (event[0].select) {           // 如果选中，并且上一次的状态也是选中，那么现在就取消（对应情况是，all选中，并且现在点击其他的，那么就取消all）
          this.cpuNumsOption[0].select = false;
          this.cpuSelected = event.slice(1);
        } else {                          // 如果现在选中，并且上一次没有选中。那么就代表，这次点击的是all，此时吧所有数据展示出来
          this.cpuNumsOption[0].select = true;
          this.cpuSelected = [].concat(this.cpuNumsOption);
        }
      } else {                          // 如果没有选中all，就循环筛选
        const arr = [];
        if (this.cpuNumsOption[0].select) {
          if (this.cpuNumsOption.length === event.length + 1) {
            this.cpuSelected = [];
            this.isDetailVisible = false;
            this.cpuNumsOption[0].select = false;
            this.noDataInfo = this.i18n.common_term_task_nodata;
          }
        } else {
          if (this.cpuNumsOption.length === event.length + 1) {
            this.cpuNumsOption[0].select = true;
            this.cpuSelected = [].concat(this.cpuNumsOption);
          }
        }
        this.dataALL.forEach((item: any, index: any) => {
          event.forEach((data: any) => {
            if (item.name === data.id) {
              arr.push(item);
            }
          });
        });
      }
      if (this.routeData.length !== 0) {
        let num = 0;
        this.cpuSelected.forEach((item, index) => {
          if (item.id === this.routeData[0].split(':')[1]) {
            num += 1;
          }
        });
        if (num === 0) {
          this.routeData = [];
          this.upperData = [];
          this.isDetailVisible = false;
        }
      }
    } else {
      this.isDetailVisible = false;
      this.routeData = [];
      this.upperData = [];
      this.noDataInfo = this.i18n.common_term_task_nodata;
    }

    // 通过已选的项过滤
    this.timingData = this.dataALL.filter((dataItem: any) => {
      return this.cpuSelected.some(cpuItem => cpuItem.id === dataItem.name);
    });

    // noData展示判断
    this.noDataShow = this.timingData.length === 0;
  }

  // 点击下一层的数据
  public childData(event: any) {
    const data = event;
    data.data.name = this.typeSelected.label + ':' + data.data.name.split(':')[1];
    this.processData(data, true);

    this.secondColor = this.color;
    this.routeData = [event.data.name, event.path]; // 路径渲染
    const obj = {
      data: event.data,
      color: JSON.parse(JSON.stringify(this.secondColor)),
      list: JSON.parse(JSON.stringify(this.childList)),
    };
    this.upperData[0] = obj;
  }

  // 下下层返回的数据
  public backData(event: any) {
    this.upperData[this.upperData.length - 1].color = JSON.parse(JSON.stringify(this.secondColor));
    this.upperData[this.upperData.length - 1].list = JSON.parse(JSON.stringify(this.childList));
    this.processData(event, true);
    this.routeData.push(event.path); // 路径渲染
    const obj = {
      data: event.data,
      color: JSON.parse(JSON.stringify(this.secondColor)),
      list: JSON.parse(JSON.stringify(this.childList)),
    };
    this.upperData[this.upperData.length] = obj;
    this.secondColor = this.color;
  }

  // 返回数据之后对数据的处理
  public processData(event: any, status: any) {
    this.childrenData = event.data;
    this.isDetailVisible = true;
    const colorData = event.data.value.columns;
    const colorArr: any = [];
    colorData.forEach((item: any, index: any) => {      // 颜色渲染
      if (index !== 0) {
        const obj = { id: '', title: '', color: '', checked: true };
        obj.id = this.axios.generateConversationId(15);
        obj.title = item;
        obj.color = this.color[index - 1];
        colorArr.push(obj);
      }
    });
    if (status) {
      this.childList = colorArr;    // 渲染颜色
    }
  }

  // 颜色筛选
  public colorChange(event: any) {
    const arr = [this.childrenData.value.columns[0]];
    const colorData: any = [];
    const data = this.deepClone(this.childrenData);
    this.childList.forEach((item: any) => {
      if (item.checked) {
        arr.push(item.title);
        colorData.push(item.color);
      }
    });
    this.secondColor = colorData;
    data.value.columns = arr;
    this.childrenData = data;
  }

  // 返回上一层级
  public Switch(index: any) {
    if (index === 0) {
      this.isDetailVisible = false;
      this.upperData = []; // 下层数据全部为空
      this.routeData = [];
    } else {
      const obj = { data: this.upperData[index - 1].data };
      this.processData(obj, false);
      this.secondColor = this.upperData[index - 1].color;
      this.childList = this.upperData[index - 1].list;
      this.routeData = this.routeData.slice(0, index + 1);
      this.colorChange('');
      this.upperData.splice(index);
    }
  }

  // 深拷贝
  public deepClone(obj: any) {
    const t = new obj.constructor();
    if (obj instanceof Date) {
      return new Date(obj);
    }
    if (obj instanceof RegExp) {
      return new RegExp(obj);
    }
    if (typeof obj !== 'object') {
      return obj;
    }
    if (obj != null) {
      Object.keys(obj).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          t[key] = this.deepClone(obj[key]);
        }
      });
    }
    return t;
  }

  public onExtraAxisTransform(val: any) {
    this.timingChartHotDomain = val;
  }

  public onTimingTransform(domain: any) {
    this.timingChartHotDomain = domain;
  }

  public setExtrapositionOption(data: any) {
    // 找出最大 timestamp 的范围
    const maxLength = Math.max(...data.map((item: any) => item.value.length));
    const maxTimestampLenItem = data.find((d: any) => d.value.length === maxLength);
    const timestampArry = maxTimestampLenItem.value.map((d: any) => d.Timestamp);
    const domainRange: [number, number] = [Math.min(...timestampArry), Math.max(...timestampArry)];

    this.extrapositionOption = {
      domain: domainRange,
      format: (d: number) => Util.fixThouSeparator(d + 'ms')
    };
  }

  // 随机ID
  public generateConversationId(len: any) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(
      ''
    );
    const uuid = [];
    let i;
    const radix = chars.length;

    if (len) {
      for (i = 0; i < len; i++) {
        uuid[i] = chars[Math.floor(Math.random() * radix)];
      }
    } else {
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      let r;
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = Math.floor(Math.random() * 16);
          uuid[i] = chars[i === 19 ? Math.floor(Math.random() * 4) + 8 : r];
        }
      }
    }
    return uuid.join('');
  }
}
