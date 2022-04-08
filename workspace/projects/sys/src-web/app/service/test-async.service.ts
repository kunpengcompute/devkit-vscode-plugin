import { Directive, forwardRef, Injectable } from '@angular/core';
import {
  AsyncValidator,
  AbstractControl,
  NG_ASYNC_VALIDATORS,
  ValidationErrors
} from '@angular/forms';
import { catchError, map } from 'rxjs/operators';
import {AxiosService} from './axios.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestAsyncService {

  constructor(public Axios: AxiosService) { }
  testvalidate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.Axios.axios.get('')
    .then((data: any) => {
      if (data[0].name === 'Analysis01') {return {cpwd: { error: true , tiErrorMessage: '两次输入密码不同'}}; } else {
        return { required: true };
      }
    });
  }
}
