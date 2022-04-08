import {
  Component, Input, ChangeDetectorRef, forwardRef, OnDestroy
} from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl
} from '@angular/forms';

interface RunUserInfo {
  runUser: boolean;
  user: string;
  password: string;
}

@Component({
  selector: 'app-run-user-input',
  templateUrl: './run-user-input.component.html',
  styleUrls: ['./run-user-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RunUserInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RunUserInputComponent),
      multi: true
    }
  ],
})
export class RunUserInputComponent implements ControlValueAccessor, OnDestroy {

  @Input()
  set runUserInfo(val: RunUserInfo) {
    if (val != null) {
      this.switchState = val.runUser;
      if (this.switchState){
        this.modeApplicationUser = val.user;
        this.modeApplicationPassWord = val.password;
        this.runUserValid = true;
        this.runPasswordValid = true;
      }
    }
  }
  get runUserInfo(): RunUserInfo {
    return {
      runUser: this.switchState,
      user: this.modeApplicationUser,
      password: this.modeApplicationPassWord
    };
  }
  @Input() labelWidth: boolean;

  i18n: any;
  switchState: boolean;
  modeApplicationUser: string;
  modeApplicationPassWord: string;
  runUserValid = true;
  runUserMsg: string;
  runPasswordValid = true;
  modeAppRunUserValid = true;
  /**
   * 这里是做一个空函数体，真正使用的方法在 registerOnChange 中
   * 由框架注册，然后我们使用它把变化发回表单
   */
  private propagateChange = (_: any) => { };

  /**
   * 这里是做一个空函数体，真正使用的方法在 registerOnTouched 中
   * 由框架注册，然后我们使用它把变化发回表单
   */
  private propagateTunched = (_: any) => { };

  constructor(
    public i18nService: I18nService,
    private cdr: ChangeDetectorRef
  ) {

    this.i18n = this.i18nService.I18n();
  }
  ngOnDestroy(){
    this.runUserValid = true;
    this.runPasswordValid = true;
    this.modeAppRunUserValid = true;
  }

  /**
   * 验证表单，验证结果正确返回 null 否则返回一个验证结果对象
   * @param ctl 控件
   */
  public validate(ctl: FormControl) {
    return this.modeAppRunUserValid ? null : { runUserInfo: { valid: false } };
  }

  /**
   * 控件 --> DOM
   * @param obj 写入的控件值
   */
  public writeValue(obj: RunUserInfo) {

    if (obj == null) {
      return;
    }

    this.switchState = obj.runUser;
    this.modeApplicationUser = obj.user;
    this.modeApplicationPassWord = obj.password;
    this.runUserValid = Boolean(obj.user);
    this.runPasswordValid = Boolean(obj.password);
    this.cdr.markForCheck();
  }
  /**
   * DOM --> 控件
   * 当表单控件值改变时，函数 fn 会被调用
   * 这也是我们把变化 emit 回表单的机制
   * @param fn 通知回调
   */
  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  /**
   * 这里没有使用，用于注册 touched 状态
   * @param fn 通知回调
   */
  public registerOnTouched(fn: any) {
    this.propagateTunched = fn;
  }

  public checkUserOrPassWord(str: string) {
    if (str === 'switch') {
      this.userAndPassword();
      this.runUserValid = true;
      this.runPasswordValid = true;
      return;
    } else if (str === 'user' && this.switchState) {
      if (this.modeApplicationUser === '') {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_empty_judge;
        this.runUserValid = false;
        this.userAndPassword();
        return;
      }
      const reg = new RegExp('^[a-zA-Z._][a-zA-Z0-9._\\-]{0,127}$');
      if (!reg.test(this.modeApplicationUser)) {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_run_user_msg;
        this.runUserValid = false;
        this.userAndPassword();
        return;
      } else {
        this.runUserValid = true;
        this.userAndPassword();
        return;
      }
    } else if (str === 'password' && this.switchState) {
      this.runPasswordValid = Boolean(this.modeApplicationPassWord);
      this.userAndPassword();
      return;
    }
  }
  private userAndPassword() {
    // 验证必选项
    if (this.switchState) {
      this.modeAppRunUserValid = Boolean(this.modeApplicationUser) && Boolean(this.modeApplicationPassWord);
    } else {
      this.modeAppRunUserValid = true;
    }
    this.propagateChange(this.runUserInfo);
    this.cdr.markForCheck();
  }
}

