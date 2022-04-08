import { Component, OnInit } from '@angular/core';
import { ADMIN } from '../../../global/globalData';
import { ONLINE_HELP } from '../../../global/url';
import { I18nService } from '../../../service';
const hardUrl: any = require('../../../../assets/hard-coding/url.json');
@Component({
  selector: 'app-about-more-system',
  templateUrl: './about-more-system.component.html',
  styleUrls: ['./about-more-system.component.scss']
})
export class AboutMoreSystemComponent implements OnInit {

  public i18n: any;
  public currentSupportOS: Array<string> = [
    'BC-Linux 7.6/7.7',
    'CentOS 7.4/7.5/7.6/7.7/8.0/8.1/8.2',
    'Deepin V15.2',
    'Debian 10',
    'EulerOS 2.8',
    'iSoft 5.1',
    'Kylin V10 SP1',
    'LinxOS 6.0.90',
    'NeoKylin V7U5/V7U6',
    'openEuler 20.03/20.03 SP1/20.03 SP2',
    'SUSE SLES 15.1',
    'Ubuntu 18.04.x/20.04.x',
    'UOS 20 SP1',
    'uosEuler 20'
  ];
  public isAdmin: boolean;
  public onlineHelp = {
    ZH_HELP: ONLINE_HELP.ZH_HELP + '#zh-cn_topic_0220268915.html',
    EN_HELP: ONLINE_HELP.EN_HELP + '#en-us_topic_0220268915.html',
  };
  public depDictoryUrl = hardUrl.depDictoryUrl;

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.isAdmin = sessionStorage.getItem('role') === ADMIN ? true : false;
  }
}
