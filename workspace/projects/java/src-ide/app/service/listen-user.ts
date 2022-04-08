/*
 * Copyright 2022 Huawei Technologies Co., Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { MytipService } from '../service/mytip.service';
import { AxiosService } from './axios.service';
import { Router } from '@angular/router';
import { VscodeService } from '../service/vscode.service';
@Injectable({
  providedIn: 'root'
})
export class ListenUserService {
  public i18n: any;
    constructor(public Axios: AxiosService,
                public mytip: MytipService,
                public i18nService: I18nService,
                public router: Router,
                private vscodeService: VscodeService) {
    this.i18n = this.i18nService.I18n();
    clearInterval(this.timer);
  }
  public time = 0;
  public timer: any;
  /**
   * clearTime
   */
  public clearTime() {
    this.time = 0;
  }
  /**
   * clickLogOut
   */
  public clickLogOut() {
    const msg = this.i18n.logout_ok;
    const config = { baseURL: this.Axios.usersManagerBaseUrl };

    this.Axios.axios.delete('/users/session/', config).then((data: any) => {
      if (data.status === 0) {
        this.showInfoBox(msg, 'info');
        setTimeout(() => {
          (self as any).webviewSession.setItem('role', '');
          (self as any).webviewSession.setItem('token', '');
          (self as any).webviewSession.setItem('username', '');
          window.location.href =
            window.location.origin + '/' + 'user-management' + '/#/login';
        }, 1000);
      }
    });
    }
    /**
     * 弹出右下角提示消息
     * @param info info
     * @param type 提示类型
     */
    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }
  /**
   * addListen
   */
  public addListen() {
    document.onmousedown = () => {
      this.clearTime();
    };
    document.onmousemove = () => {
      this.clearTime();
    };
    window.onmousewheel = () => {
      this.clearTime();
    };
    document.onclick = () => {
      this.clearTime();
    };
    document.onscroll = () => {
      this.clearTime();
    };
    document.onkeypress = () => {
      this.clearTime();
    };
    this.timer = setInterval(() => {
      this.time++;
      if (this.time > 600) {
        this.clickLogOut();
        clearInterval(this.timer);
      }
    }, 1000);
  }
}
