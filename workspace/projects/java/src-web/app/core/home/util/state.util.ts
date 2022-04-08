import { Injectable } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class StateUtil {
  constructor(
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  /**
   * 获取guardian基本状态
   */
  public getGuardianState(item: any) {
    let state = '';
    if (item.isRunningInContainer) {
      switch (item.state) {
        case 'CONNECTED':
          state = this.i18n.common_term_guardian_normal;
          break;
        case 'DISCONNECTED':
          state = this.i18n.common_term_guardian_disconnected;
          break;
        case 'DEPLOYED':
          state = this.i18n.common_term_guardian_deploying;
          break;
        default:
          state = this.i18n.common_term_guardian_connecting;
          break;
      }
    } else {
      switch (item.state) {
        case 'CONNECTED':
          state = this.i18n.common_term_guardian_normal;
          break;
        case 'DISCONNECTED':
          state = this.i18n.common_term_guardian_disconnected;
          break;
        case 'DEPLOYED':
          state = this.i18n.common_term_guardian_deploying;
          break;
        default:
          state = this.i18n.common_term_guardian_connecting;
          break;
      }
    }
    return state;
  }

  /**
   * sampling记录的不同状态图标
   */
  public recodeStateFormat(state: any) {
    let src = '';
    switch (state) {
      case 'SCHEDULED':
        src = './assets/img/home/loading-1.svg';
        break;
      case 'CONFIGURING':
        src = './assets/img/home/loading-1.svg';
        break;
      case 'FINISHED':
        src = './assets/img/home/success.svg';
        break;
      case 'RECORDING':
        src = './assets/img/home/loading-2.svg';
        break;
      case 'FAILED':
        src = './assets/img/home/error.svg';
        break;
      default:
        break;
    }
    return src;
  }
  /**
   * 内存记录的不同状态图标
   */
  public heapdumpStateFormat(state: any) {
    let src = '';
    switch (state) {
      case 'NEW':
        src = './assets/img/home/loading-1.svg';
        break;
      case 'PARSING':
        src = './assets/img/home/loading-2.svg';
        break;
      case 'PARSE_COMPLETED':
        src = './assets/img/home/success.svg';
        break;
      case 'FAILED':
        src = './assets/img/home/error.svg';
        break;
      default:
        break;
    }
    return src;
  }

  /**
   * 内存记录的不同状态图标
   */
  public guardianRunningStateFormat(item: any) {
    let stateImg = '';
    if (item.isRunningInContainer) {
      switch (item.state) {
        case 'CONNECTED':
          stateImg = './assets/img/home/container-normal.svg';
          break;
        case 'DISCONNECTED':
          stateImg = './assets/img/home/container-timeout.svg';
          break;
        default:
          stateImg = './assets/img/home/container-creating.svg';
          break;
      }
    } else {
      switch (item.state) {
        case 'CONNECTED':
          stateImg = './assets/img/home/physics-normal.svg';
          break;
        case 'DISCONNECTED':
          stateImg = './assets/img/home/physics-timeout.svg';
          break;
        default:
          stateImg = './assets/img/home/physics-creating.svg';
          break;
      }
    }
    return stateImg;
  }
}
