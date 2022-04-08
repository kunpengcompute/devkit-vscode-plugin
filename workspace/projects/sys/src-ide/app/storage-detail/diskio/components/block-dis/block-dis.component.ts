import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';

@Component({
    selector: 'app-block-dis',
    templateUrl: './block-dis.component.html',
    styleUrls: ['./block-dis.component.scss'],
})
export class BlockDisComponent implements OnInit {
    /** 输入数据 */
    @Input() type: string;
    @Input() devData: any;
    // 读写数据
    public rowDataRead: Array<object>;
    public rowDataWrite: Array<object>;
    public i18n: any;
    public titleList: any = [];
    public devList: any = [];
    public selectDev = '';
    public showDataDetails = false;
    public title: any;
    constructor(
        public i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.delData();

    }

    /**
     * 处理数据
     */
    public delData() {
        this.devList = Object.keys(this.devData);
        this.selectDev = this.devList[0];
        let key = 'd2c_delay_block';
        this.titleList = [
            this.i18n.storageIO.diskio.delay_dis,
            this.i18n.storageIO.diskio.read_delay,
            this.i18n.storageIO.diskio.write_delay
        ];
        if (this.type === 'data_size') {
            key = 'data_block';
            this.titleList = [
                this.i18n.storageIO.diskio.block_dis,
                this.i18n.storageIO.diskio.read_block,
                this.i18n.storageIO.diskio.write_block
            ];
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
            const readKeys = Object.keys( this.devData[val].read[key]);
            const readItem = { time: this.devData[val].time, dev: val,
                            title: this.title, data: this.devData[val].read[key] };
            this.rowDataRead.push(readItem);
            const writeItem = { time: this.devData[val].time, dev: val, data: this.devData[val].write[key] };
            this.rowDataWrite.push(writeItem);
        });
    }
}
