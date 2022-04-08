import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AxiosService } from '../../../../service/axios.service';
import { CommonService } from '../../../../service/common/common.service';

@Component({
  selector: 'app-byte-show',
  templateUrl: './byte-show.component.html',
  styleUrls: ['./byte-show.component.scss']
})
export class ByteShowComponent implements OnInit {
  @Input() diffPath: any;
  @Input() reportId: any;
  @Input() isCheck: any;
  @ViewChild('codeShow', { static: false }) codeShow: any;
  public temp: any = null;
  public step: any = null;
  public struckStep: any = null;
  public report: any;
  public routerFileDQJC: any;
  public routerFile: any;
  public currLang: any;
  constructor(
    private route: ActivatedRoute,
    private Axios: AxiosService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.routerFile = sessionStorage.getItem('routerFile');
    this.routerFileDQJC = sessionStorage.getItem('routerFileDQJC');
    this.currLang = sessionStorage.getItem('language');
    if (sessionStorage.getItem('isFirst') !== '1') {
    this.getByteAlignmentInfo(this.diffPath, this.reportId);
    }
  }
  getByteAlignmentInfo(diffPath: any, reportId: any) {
    const params = {
        file_path: diffPath,
        task_name: reportId
    };
    this.temp = null;
    this.Axios.axios.post(`/portadv/tasks/migration/bytealignment/taskresult/`, params).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        this.temp = resp.data;
      }
    });
  }
  public layout() {
    this.codeShow.doLayout();
  }
  public scrollToRight(data: any) {
    this.step = data;
  }
  public scrollToLeft(data: any) {
    this.struckStep = data;
  }
}
