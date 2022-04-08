import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors} from '@angular/forms';
import { AxiosService } from './axios.service';
import { MessageService } from './message.service';
import { I18nService } from '../service/i18n.service';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomValidatorsService {
  public i18n: any;
  constructor(public Axios: AxiosService, public msgService: MessageService, public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }

  public lang: any = sessionStorage.getItem('language');

  // 异步表单验证
  public applicationCheck(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    const params = {
      application: ctrl.value
    };
    if (ctrl.value !== '') {
      return this.Axios.axios.post('/DataSampling/CheckApplication', params)
        .then((data: any) => {
          if (data.status === 1) {
            if (data.info.indexOf('not exist in the system') > -1) {
              return { aaa: { tiErrorMessage: this.i18n.application_not_exist } };
            } else if (data.info.indexOf('user has no rights') > -1) {
              return { aaa: { tiErrorMessage: this.i18n.application_not_access } };
            } else {
              return { aaa: { tiErrorMessage: this.i18n.application_not_exist } };
            }
          } else if (data.status === 11) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_application_permisson } };
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => {});
    }
  }

  public CheckCpuMask(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    const params = {
      cpumask: ctrl.value
    };
    if (ctrl.value !== '') {
      return this.Axios.axios.post('/DataSampling/CheckCpuMask', params)
        .then((data: any): any => {
          if (data.status === 1) {
            if (data.info.indexOf('out of device cpu range') > -1) {
              const maxRange = (data.data['CPU(S)'] - 1) + (this.lang === 'zh-cn' ? '。' : '.');
              return { aaa: { tiErrorMessage: this.i18n.cpu_mask_range + maxRange } };
            } else if (data.info.indexOf('data format error') > -1) {
              return { aaa: { tiErrorMessage: this.i18n.cpu_mask_format } };
            }
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => {});
    }
  }

  public CheckWorkingDirectory_c(
    ctrl: AbstractControl, file: any
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    let filedname = '';
    let value = '';
    if (Object.prototype.hasOwnProperty.call(arguments[0], 'filedname')) {
      filedname = arguments[0].filedname;
      value = arguments[1].value;
    }
    const params = {
      field_name: filedname,
      working_directory: value
    };
    if (value) {
      return this.Axios.axios.post('/DataSampling/CheckWorkingDirectory', params)
        .then((data: any): any => {
          if (data.status === 1) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory } };
          } else if (data.status === 11) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory_permisson } };
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => {});
    }
  }

  public CheckWorkingDirectory_java(
    ctrl: AbstractControl, file: any
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    let filedname = '';
    let value = '';
    if (Object.prototype.hasOwnProperty.call(arguments[0], 'filedname')) {
      filedname = arguments[0].filedname;
      value = arguments[1].value;
    }
    const params = {
      field_name: filedname,
      working_directory: value
    };
    if (value) {
      return this.Axios.axios.post('/DataSampling/CheckWorkingDirectory', params)
        .then((data: any): any => {
          if (data.status === 1) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory } };
          } else if (data.status === 11) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory_permisson } };
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => {});
    }
  }

  public CheckPid_Tid(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {

    const params = {
      pid: ctrl.value
    };
    if (ctrl.value) {
      return this.Axios.axios.post('/DataSampling/CheckPid', params)
        .then((data: any): any => {
          if (data.status === 1) {
            return { aaa: { tiErrorMessage: this.i18n.pid_not_exist } };
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => {});
    }
  }

  public CheckPid_Common_Der(
    ctrl: AbstractControl, file: any
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    let filedname = '';
    let value = '';
    if (Object.prototype.hasOwnProperty.call(arguments[0], 'filedname')) {
      filedname = arguments[0].filedname;
      value = arguments[1].value;
    }
    const params = {
      field_name: filedname,
      working_directory: value
    };
    if (value) {
      return this.Axios.axios.post('/DataSampling/CheckWorkingDirectory', params)
        .then((data: any): any => {
          if (data.status === 1) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory_common } };
          } else if (data.status === 11) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory_permisson } };
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => {});
    }
  }
}
