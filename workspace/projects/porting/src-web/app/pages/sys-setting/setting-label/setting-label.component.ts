import { Component, OnInit } from '@angular/core';
import {
  I18nService, AxiosService, MytipService,
  CommonService
} from '../../../service';

@Component({
  selector: 'app-setting-label',
  templateUrl: './setting-label.component.html',
  styleUrls: ['./setting-label.component.scss']
})
export class SettingLabelComponent implements OnInit {

  public commonConfigSel = {
    keepGoing: {
      label: '',
      range: [
        { label: '', value: 1, inputMode: 'select'},
        { label: '', value: 0, inputMode: 'select'}
      ],
      msg: ''
    },
    pMonthFlag: {
      label: '',
      range: [
        { label: '', value: 1, inputMode: 'select'},
        { label: '', value: 0, inputMode: 'select'}
      ],
      msg: ''
    },
  };

  public commonConfigInput = {
    cLine: {
      label: ''
    },
    asmLine: {
      label: ''
    },
    password: {
      label: '',
    },
  };
  // 扫描参数配置-关键字扫描
  public commonConfigSelValue = [
    {label: '', value: 1, inputMode: 'select'},
    {label: '', value: 1, inputMode: 'select'}
  ];
  public loginUserId: any; // 登录用户的相关信息

  public commonConfigInputValue: Array<string>; // 用户密码值
  public currZh = true;

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  ngOnInit() {
    this.currZh = sessionStorage.getItem('language') === 'zh-cn';
    this.commonConfigInputValue = [];
    this.commonConfigSel = {
      keepGoing: {
        label: this.i18n.common_term_keep_going_tip,
        range: [
          { label: this.i18n.common_term_yes, value: 1, inputMode: 'select'},
          { label: this.i18n.common_term_no, value: 0, inputMode: 'select'}
        ],
        msg: this.i18n.common_term_keep_going_tip_remark
      },
      pMonthFlag: {
        label: this.i18n.common_term_p_month_flag,
        range: [
          { label: this.i18n.common_term_yes, value: 1, inputMode: 'select'},
          { label: this.i18n.common_term_no, value: 0, inputMode: 'select'}
        ],
        msg: ''
      },
    };
    this.commonConfigInput = {
      cLine: {
        label: this.i18n.common_term_c_line + this.i18n.common_term_c_line_unit
      },
      asmLine: {
        label: this.i18n.common_term_asm_line + this.i18n.common_term_c_line_unit
      },
      password: {
      label: this.i18n.common_term_userPwd_label,
    },
    };
    this.loginUserId = sessionStorage.getItem('loginId');
    this.getConfigData();
  }
  /**
   * 获取关键字config关键字扫描
   */
  public getConfigData() {
    this.commonConfigInputValue = [];
    this.Axios.axios.get(`/users/${encodeURIComponent(this.loginUserId)}/config/`).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.commonConfigInputValue.push(String(data.data.c_line));
        this.commonConfigInputValue.push(String(data.data.asm_line));
        if (data.data.keep_going === true) {
          this.commonConfigSelValue[0] = {
            label: this.i18n.common_term_yes,
            value: 1,
            inputMode: 'select'
          };
        } else {
          this.commonConfigSelValue[0] = {
            label: this.i18n.common_term_no,
            value: 0,
            inputMode: 'select'
          };
        }
        if (data.data.p_month_flag === true) {
          this.commonConfigSelValue[1] = {
            label: this.i18n.common_term_yes,
            value: 1,
            inputMode: 'select'
          };
        } else {
          this.commonConfigSelValue[1] = {
            label: this.i18n.common_term_no,
            value: 0,
            inputMode: 'select'
          };
        }
      }
    });
  }
  /**
   * 修改config关键字扫描
   */
  public onConfigConfirm(val: any) {
    const params = {
      asm_line: Number(val[1]),
      c_line: Number(val[0]),
      keep_going: Number(val[2]),
      p_month_flag: Number(val[3]),
      password: val[4]
    };
    const url = `/users/${encodeURIComponent(this.loginUserId)}/config/`;
    this.Axios.axios.post(url, params).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
          this.myTip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
          this.getConfigData();
      } else {
        this.myTip.alertInfo({
          type: 'error',
          content: this.currZh ? data.infochinese : data.info,
          time: 3500,
        });
        this.getConfigData();
      }
    });
  }

}
