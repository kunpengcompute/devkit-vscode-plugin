import {
  FormGroup,
  FormArray,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { IpProtocolType } from './../../domain';
import { IPv4NodeData, IPv6NodeData } from './ip-node-data.type';
import { Cat } from 'hyper';
import { Injectable } from '@angular/core';
import { TiValidators } from '@cloud/tiny3';
import { I18n } from 'sys/locale';

type INetIoNodeList = IPv4NodeData[] | IPv6NodeData[];

@Injectable({
  providedIn: 'root',
})
export class IpNodeInfoService {
  initFormArray(type: IpProtocolType, nodeList?: INetIoNodeList): FormArray {
    const isBadArgu =
      (Cat.isArr(nodeList) && Cat.isEmpty(nodeList)) || !Cat.isArr(nodeList);
    if (isBadArgu) {
      nodeList = [null];
    }
    const fgList =
      type === IpProtocolType.IPv4
        ? (nodeList as IPv4NodeData[]).map((node) =>
            this.initFormGroup(type, node)
          )
        : (nodeList as IPv6NodeData[]).map((node) =>
            this.initFormGroup(type, node)
          );

    return new FormArray(fgList);
  }

  initFormGroup(type: IpProtocolType, node?: any): FormGroup {
    const nodeInfo =
      type === IpProtocolType.IPv4
        ? {
            serverIp: new FormControl(node?.serverIp || '', [
              TiValidators.required,
            ]),
            sourceIp: new FormControl(node?.sourceIp || ''),
            destinationIp: new FormControl(node?.destinationIp || '', [
              TiValidators.required,
            ]),
          }
        : {
            serverIp: new FormControl(node?.serverIp || '', [
              TiValidators.required,
            ]),
            sourceEth: new FormControl(node?.sourceEth || '', [
              TiValidators.required,
              this.checkNetworkParam(
                I18n.network_diagnositic.taskParams.source_network_port
              ),
            ]),
            destinationIp: new FormControl(node?.destinationIp || '', [
              TiValidators.required,
            ]),
          };

    return new FormGroup(nodeInfo);
  }

  setFormArray(
    protocolType: IpProtocolType,
    formArray: FormArray,
    nodeList: any[]
  ) {
    if (formArray == null) {
      return;
    }

    if (
      !Cat.isArr(nodeList) ||
      (Cat.isArr(nodeList) && Cat.isEmpty(nodeList))
    ) {
      const formGroup = this.initFormGroup(protocolType);
      formArray.setValue([formGroup]);
      return;
    }

    while (formArray.length) {
      formArray.removeAt(0);
    }
    nodeList.forEach((node) => {
      formArray.push(this.initFormGroup(protocolType, node));
    });
  }
  checkNetworkParam(labelName: string): any {
    const reg = new RegExp(/^[a-zA-Z0-9]{2,15}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      if (!reg.test(control.value)) {
        return {
          pwd: { tiErrorMessage: labelName + I18n.validata.networkPort },
        };
      } else {
        return null;
      }
    };
  }
}
