import { ConstantPool } from '@angular/compiler';
import { I18n } from 'sys/locale';
import { VerificationMethod } from '../domain';

export class VerificationWay {
  static markToLang(mark: VerificationMethod) {
    const markToLangMap = new Map<VerificationMethod, string>([
      [VerificationMethod.Password, I18n.nodeManagement.passwordAuth],
      [VerificationMethod.PrivateKey, I18n.nodeManagement.private_key_auth],
    ]);
    return markToLangMap.get(mark);
  }
  static langToMark(lang: string): VerificationMethod {
    const langToMarkMap = new Map<string, VerificationMethod>([
      [I18n.nodeManagement.passwordAuth, VerificationMethod.Password],
      [I18n.nodeManagement.private_key_auth, VerificationMethod.PrivateKey],
    ]);
    return langToMarkMap.get(lang);
  }
}
