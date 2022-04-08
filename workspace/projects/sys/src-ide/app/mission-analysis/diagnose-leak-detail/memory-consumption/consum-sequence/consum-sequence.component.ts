import {
  Component, OnInit, Input, ElementRef, ViewChild
} from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { VscodeService } from '../../../../service/vscode.service';
import { LeftShowService } from '../../../../service/left-show.service';
import { Utils } from '../../../../service/utils.service';

@Component({
  selector: 'app-consum-sequence',
  templateUrl: './consum-sequence.component.html',
  styleUrls: ['./consum-sequence.component.scss']
})
export class ConsumSequenceComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskId: any;
  @Input() nodeId = 1;
  public ppid: any;
  @Input()
  get pid() {
    return this.ppid;
  }
  set pid(data: any) {
    if (data !== '--') {
      this.ppid = data;
      this.getData();
    }
  }
  @Input()
  set tableData(data: any) {
    if (data && data.length > 0) {
      this.processOption = data;
      this.selectedProcess = this.processOption[0];
    }
  }
  constructor(
    public i18nService: I18nService,
    private el: ElementRef,
    private leftShowService: LeftShowService,
    private vscodeService: VscodeService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('timeLineDetail') timeLineDetail: any;
  @ViewChild('map') map: any;
  @ViewChild('sys') sys: any;
  @ViewChild('app') app: any;
  @ViewChild('dist') dist: any;
  public i18n: any;
  public initializing = true;
  public sysData: any;
  public appData: any;
  public distData: any;
  public mapData: any;
  public selectedProcess = { label: '--', disabled: false, pid: 0, mmapping: '', address: '' };
  public processOption: { label: any, disabled: boolean, pid: number, mmapping: string, address: string }[] = [];
  public timeData: any = []; // 时间轴数据
  public timeLine = {
    start: 0,
    end: 100
  };
  public originMapData: any;
  public originMapTitle: any;
  public nodataTips: string;

  ngOnInit(): void {
    this.nodataTips = this.i18n.loading;
  }

  /**
   * 时间轴筛选
   * @param e 时间参数
   */
  public timeLineData(e: any) {
    this.timeLine = e;
    this.leftShowService.timelineUPData.next(e);
  }

  // 数据筛选时间轴改变
  public dataZoom(e: any) {
    this.timeLine = e;
    this.timeLineDetail.dataConfig(e);
  }

  /**
   * 获取时序图数据
   */

  public getData() {
    const params = {
      nodeId: this.nodeId,
      pid: this.pid,
    };
    this.vscodeService.get({
      url: `/memory-analysis/${this.taskId}/mem-consume-timing-info/?${Utils.converUrl(params)}`
    }, (resp: any) => {
      const data = resp.data?.mem_consume_timing_info?.data?.data;
      const title = resp.data?.mem_consume_timing_info?.data?.title;
      const value: any = {};
      title.forEach((val: string, idx: number) => {
        const arr: any[] = [];
        data.forEach((el: any[]) => {
          arr.push(el[idx]);
        });
        value[val] = arr;
      });
      this.timeData = this.setTime(value.time);
      this.sysData = {
        keys: [{ title: this.i18n.diagnostic.consumption.sequence.rss, key: 'rss' },
        { title: this.i18n.diagnostic.consumption.sequence.vss, key: 'vss' }],
        value,
        title: this.i18n.common_term_projiect_task_system,
        time: this.timeData,
        yearTime: value.time
      };
      this.appData = {
        keys: [{ title: this.i18n.diagnostic.consumption.sequence.malloc_size, key: 'malloc_size' },
        { title: this.i18n.diagnostic.consumption.sequence.malloc_count, key: 'malloc_count' },
        { title: this.i18n.diagnostic.consumption.sequence.free_count, key: 'free_count' },
        { title: this.i18n.diagnostic.consumption.sequence.free_size, key: 'free_size' }],
        value,
        title: this.i18n.diagnostic.consumption.apply,
        time: this.timeData,
        yearTime: value.time
      };
      this.distData = {
        keys: [{ title: this.i18n.diagnostic.consumption.sequence.system_bytes, key: 'system_bytes' },
        { title: this.i18n.diagnostic.consumption.sequence.free_bytes, key: 'free_bytes' },
        { title: this.i18n.diagnostic.consumption.sequence.in_use_bytes, key: 'in_use_bytes' },
        { title: this.i18n.diagnostic.consumption.sequence.arena, key: 'arena' },
        { title: this.i18n.diagnostic.consumption.sequence.mmap_count, key: 'mmap_count' },
        { title: this.i18n.diagnostic.consumption.sequence.mmap_size, key: 'mmap_size' }],
        value,
        title: this.i18n.diagnostic.consumption.distributor,
        time: this.timeData,
        yearTime: value.time
      };
      if (this.sys) {
        this.sys.setData(this.timeLine);
      }
      if (this.app) {
        this.app.setData(this.timeLine);
      }
      if (this.dist) {
        this.dist.setData(this.timeLine);
      }
      this.getMapData();
    });
  }

  /**
   * 截取采集时间, 去掉年月日
   */
  public setTime(timeData: string[]) {
    let timeList: string[] = [];
    if (timeData.length > 0) {
      timeList = timeData.map(val => {
        return val.split(' ')[1];
      });
    }
    return timeList;
  }

  /**
   * 获取map时序图数据
   */

  public getMapData() {
    const params = {
      nodeId: this.nodeId,
      pid: this.pid,
    };
    this.vscodeService.get({
      url: `/memory-analysis/${this.taskId}/mapping-timing-info/?${Utils.converUrl(params)}`
    }, (resp: any) => {
      this.originMapData = resp.data?.mapping_timing_info?.data?.data;
      this.originMapTitle = resp.data?.mapping_timing_info?.data?.title;
      this.selectProcess();
      this.initializing = false;
    });
  }

  /**
   * 切换进程,下拉选项改变map时序图数据
   */
  public selectProcess() {
    if (this.originMapData && this.originMapData.length > 0) {
      const value: any = {};
      let pidIdx = this.originMapData.findIndex((el: string[]) => el[1] === this.selectedProcess.address);
      if (pidIdx < 0) {
        pidIdx = 0;
      }
      this.originMapTitle.forEach((val: string, idx: number) => {
        value[val] = this.originMapData[pidIdx][idx];
      });
      // 将map信息时间拟合系统时间信息
      const timeData0 = this.setTime(value.time);
      let num = 0;
      const timeData1 = this.timeData.map((time: string, idx: number) => {
        if (value.rss[idx] !== '-') {
          num++;
          return timeData0[num - 1] || time;
        }
        return time;
      });
      this.mapData = {
        keys: [{ title: this.i18n.diagnostic.consumption.sequence.rss, key: 'rss' },
        { title: this.i18n.diagnostic.consumption.sequence.vss, key: 'vss' }],
        value,
        title: '',
        time: timeData1,
        yearTime: value.time
      };
    }
    if (this.map) {
      setTimeout(() => {
        this.map.setData(this.timeLine);
      });
    } else {
      this.nodataTips = this.i18n.common_term_task_nodata2;
    }
  }

}
