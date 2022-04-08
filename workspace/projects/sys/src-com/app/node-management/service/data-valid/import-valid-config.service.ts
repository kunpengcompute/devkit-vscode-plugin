import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { CustomValidatorsService } from 'sys/src-com/app/service/custom-validators.service';
import { TinyValidator, ValidContext, CustomValidator } from './valildator';
import { Cat } from 'hyper';
import { I18n } from 'sys/locale';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImportValidConfigService {
  private importValidConfig: {
    base: { [key: string]: FormControl };
    crossover: ValidationErrors;
  };

  constructor(private customValidatorsServe: CustomValidatorsService) {
    this.importValidConfig = {
      base: {
        count: new FormControl(),
        node_name: new FormControl('', [
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.maxLength(32)),
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.minLength(1)),
          new ValidContext()
            .setValidator(new CustomValidator())
            .valid(this.customValidatorsServe.nodeNameValidator),
        ]),
        ip: new FormControl('', [
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.required),
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.ipv4),
        ]),
        port: new FormControl('', [
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.maxValue(65535)),
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.minValue(1)),
        ]),
        user_name: new FormControl('', [
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.required),
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.maxLength(32)),
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.minLength(1)),
          new ValidContext()
            .setValidator(new CustomValidator())
            .valid(this.customValidatorsServe.checkHasChinese),
        ]),
        verification_method: new FormControl('', [
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.required),
        ]),
        password: new FormControl(),
        identity_file: new FormControl(),
        passphrase: new FormControl(),
        agent_install_path: new FormControl('', [
          new ValidContext()
            .setValidator(new TinyValidator())
            .valid(TiValidators.maxLength(255)),
        ]),
        root_password: new FormControl(),
      },
      crossover: (control: FormGroup): ValidationErrors | null => {
        const errors: ValidationErrors = {};
        const userName = control.get('user_name').value?.toString()?.trim();
        const verificationMethod = control
          .get('verification_method')
          .value?.toString()
          ?.trim();
        const password = control.get('password').value?.toString()?.trim();
        const identityFile = control
          .get('identity_file')
          .value?.toString()
          ?.trim();
        const rootPassword = control
          .get('root_password')
          .value?.toString()
          ?.trim();
        if ('password' === verificationMethod && !password) {
          errors.password = [I18n.nodeManagement.pwAuthTip];
        } else {
          delete errors.password;
        }
        if (userName && 'root' !== userName && !rootPassword) {
          errors.root_password = [I18n.nodeManagement.notRootPwTip];
        } else {
          delete errors.root_password;
        }
        if ('private_key' === verificationMethod && !identityFile) {
          errors.identity_file = [I18n.nodeManagement.keyAuthTip];
        } else {
          delete errors.identity_file;
        }
        return Cat.isEmpty(errors) ? null : errors;
      },
    };
  }

  getValidConfig() {
    return this.importValidConfig;
  }
}
