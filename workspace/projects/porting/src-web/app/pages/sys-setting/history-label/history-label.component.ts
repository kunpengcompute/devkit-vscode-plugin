import { Component, OnInit } from '@angular/core';
import {
  I18nService, AxiosService, MytipService,
  MessageService, CommonService
} from '../../../service';

@Component({
  selector: 'app-history-label',
  templateUrl: './history-label.component.html',
  styleUrls: ['./history-label.component.scss']
})
export class HistoryLabelComponent implements OnInit {

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService,
    private messageServe: MessageService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public hisConfig: Array<object>;
  public hisVal: any = [];
  public currZh = true;

  ngOnInit() {
    this.hisConfig = [
      {
        label: this.i18n.common_term_history_label_warnNum,
        range: [1, 49],
        msg: this.i18n.common_term_history_label_warnTip
      },
      {
        label: this.i18n.common_term_history_label_maxNum,
        range: [2, 50],
        msg: this.i18n.common_term_history_label_maxTip
      }
    ];
    this.currZh = sessionStorage.getItem('language') === 'zh-cn';
    this.getHistaskNums();
  }
  /**
   * 获取历史作业任务门限值
   */
  public getHistaskNums() {
    this.hisVal = [];
    this.Axios.axios.get(`/portadv/tasks/histasknums/`).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.hisVal.push(data.data.safenums, data.data.dangerousnums);
      }
    });
  }
  /**
   * 修改历史作业任务门限值
   */
  public onHisConfirm(val: any) {
    if (JSON.stringify(val) === JSON.stringify(this.hisVal)) {
      this.myTip.alertInfo({
        type: 'warn',
        content: this.i18n.system_setting.info,
        time: 3500,
      });
      return;
    }
    const temp = this.hisVal;
    this.hisVal = val;
    const params = {
      safenums: val[0],
      dangerousnums: val[1]
    };
    this.Axios.axios.post('/portadv/tasks/modifyhistasknums/', params)
      .then((data: any) => {
        if (this.commonService.handleStatus(data) === 0 ) {
          this.messageServe.sendMessage({
            type: 'isreportChange',
            value: true
          });
          this.getHistaskNums();
          this.myTip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.edite_ok,
            time: 3500,
          });
        } else {
          this.myTip.alertInfo({
            type: 'error',
            content: this.currZh ? data.infochinese : data.info,
            time: 3500,
          });
          this.getHistaskNums();
        }
      })
      .catch(() => {
        this.hisVal = temp;
      });
  }
}
