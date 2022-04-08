import { Component, OnInit, Input, ViewChild} from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-block-dis',
  templateUrl: './block-dis.component.html',
  styleUrls: ['./block-dis.component.scss']
})
export class BlockDisComponent implements OnInit {
  @Input() type: string;
  /** 输入数据 */
  @Input() devData: any;
  public rowDataRead: Array<object>;
  public rowDataWrite: Array<object>;
  public devList: any = [];
  public titleList: any = [];
  public title: any;
  public selectDev = '';
  public showDataDetails = false;
  @ViewChild('dataTableChart') dataTableChart: any;  // echarts框组件
  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.lang = sessionStorage.getItem('language');
  }
  public lang: any; // 语言,zh-cn: 中文, 'en-us': 英文
  public i18n: any;
  ngOnInit() {
    this.delData();
  }

  public delData() {
    this.devList = Object.keys(this.devData);
    this.selectDev = this.devList[0];
    let key = 'd2c_delay_block';
    this.titleList = [
      this.i18n.storageIO.diskio.delay_dis,
      this.i18n.storageIO.diskio.read_delay,
      this.i18n.storageIO.diskio.write_delay
      ];
    this.title = this.i18n.storageIO.diskio.delay_dis;
    if (this.type === 'data_size') {
      key = 'data_block';
      this.titleList = [this.i18n.storageIO.diskio.block_dis, this.i18n.storageIO.diskio.read_block,
        this.i18n.storageIO.diskio.write_block];
      this.title = this.i18n.storageIO.diskio.block_dis;
    }
    if (this.type === 'i2d_delay_avg') {
      key = 'i2d_delay_block';
      this.titleList = [
        this.i18n.storageIO.diskio.delay_dis_I2D,
        this.i18n.storageIO.diskio.read_delay_I2D,
        this.i18n.storageIO.diskio.write_delay_I2D
        ];
      this.title = this.i18n.storageIO.diskio.delay_dis_I2D;
    }
    this.rowDataRead = [];
    this.rowDataWrite = [];
    this.devList.forEach((val: any) => {
      const readKeys = Object.keys(this.devData[val].read[key]);
      const readItem = { time: this.devData[val].time, dev: val, title: this.title, data: this.devData[val].read[key] };
      this.rowDataRead.push(readItem);
      const writeItem = { time: this.devData[val].time, dev: val,
         title: this.title, data: this.devData[val].write[key] };
      this.rowDataWrite.push(writeItem);

    });
  }


}
