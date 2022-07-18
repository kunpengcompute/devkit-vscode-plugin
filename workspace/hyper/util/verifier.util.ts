// 密码允许字符
const allowSpecialChar = '`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?';


export class VerifierUtil {
  constructor() {
  }

  static passwordVerification(password: string): boolean {
    if (password === null || typeof password !== 'string') {
      return false;
    }
    if (password.length < 8 || password.length > 32) {
      return false;
    }
    const passwordArray = password.split('');
    let numberType = 0;
    let lowerCaseType = 0;
    let upperCaseType = 0;
    let specialCharType = 0;

    for (const char of passwordArray) {
      const charCode = char.charCodeAt(0);
      if (charCode >= 48 && charCode <= 57) { // 数字字符
        numberType = 1;
      } else if (charCode >= 65 && charCode <= 90){ // 大写字母
        upperCaseType = 1;
      } else if (charCode >= 97 && charCode <= 122) { // 小写字母
        lowerCaseType = 1;
      } else if (allowSpecialChar.indexOf(char) !== -1) { // 允许的特殊字符
        specialCharType = 1;
      } else {
        return false;
      }
    }
    if ((numberType + lowerCaseType + upperCaseType + specialCharType) < 2) {
      return false;
    }
    return true;
  }
}
