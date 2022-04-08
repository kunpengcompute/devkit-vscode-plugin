import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DeteleUsernamePasswordService {

  constructor() { }
  public async deteleUsernameAndPassword(formGroup: FormGroup) {
    formGroup.get('runUserStatus').setValue(false);
    formGroup.get('user').setValue('');
    formGroup.get('password').setValue('');
  }
}
