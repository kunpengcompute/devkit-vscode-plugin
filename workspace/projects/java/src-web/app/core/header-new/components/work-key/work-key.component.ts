import { Component, OnInit } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';

@Component({
  selector: 'app-work-key',
  templateUrl: './work-key.component.html',
  styleUrls: ['./work-key.component.scss']
})
export class WorkKeyComponent implements OnInit {

  constructor(
    public i18nServe: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService
  ) {
    this.i18n = this.i18nServe.I18n();
  }
  public i18n: any;
  public isLoading: any = false;
  ngOnInit(): void {
  }
  handleRefreshWorkingKey() {
    this.isLoading = true;
    this.Axios.axios.post('tools/workingKey', null, { headers: { showLoading: false } }).then((res: any) => {
      this.isLoading = false;
      if (res.code === 0) {
        this.myTip.alertInfo({
          type: 'success',
          content: res.message,
          time: 3500
        });
      }
    }).catch(() => {
      this.isLoading = false;
    });
  }
}
