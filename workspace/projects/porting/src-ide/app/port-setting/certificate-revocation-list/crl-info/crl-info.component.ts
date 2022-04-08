import { Component, OnInit, Input } from '@angular/core';
import { TiTableRowData, TiTableSrcData, TiTableColumns } from '@cloud/tiny3';

import { I18nService } from '../../../service/i18n.service';

@Component({
  selector: 'app-crl-info',
  templateUrl: './crl-info.component.html',
  styleUrls: ['./crl-info.component.scss']
})
export class CrlInfoComponent implements OnInit {

  @Input() data: Array<object>;

  constructor(private i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public showGotoLink: boolean;
  public columns: Array<TiTableColumns> = [
    {
      title: '',
      width: '60%'
    },
    {
      title: '',
      width: '40%'
    }
  ];

  ngOnInit(): void {
    this.showGotoLink = true;
    this.columns[0].title = this.i18n.plugins_certificate_revocation_list.serialNumber;
    this.columns[1].title = this.i18n.plugins_certificate_revocation_list.revocationDate;
    this.totalNumber = this.data.length;

    this.srcData = {
      data: this.data,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }

}

