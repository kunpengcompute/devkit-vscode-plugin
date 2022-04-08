import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { HttpService, I18nService, CustomValidatorsService } from 'sys/src-com/app/service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { TiModalService, TiValidationConfig } from '@cloud/tiny3';

@Component({
  selector: 'app-node-list-config',
  templateUrl: './node-list-config.component.html',
  styleUrls: ['./node-list-config.component.scss']
})
export class NodeListConfigComponent implements OnInit {
  @Input() nodeConfigList: any;
  @Input() modeValue: number;
  @Input() inputWidth = '480px';
  @Input() alertTipBox: string;
  @Output() private handleConfigData = new EventEmitter<any>();
  @ViewChild('nodeConfigModal', { static: false }) nodeConfigModal: any;

  public i18n: any;
  public nodeParams: any = {};
  public labelWidth = '200px';
  public tipWidth = '370px';
  public form: any = {};
  public formGroup: FormGroup;
  public userFormGroup: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public appParamsValid = true;
  public processPidValid = true;
  constructor(
    public i18nService: I18nService,
    public fb: FormBuilder,
    private tiModal: TiModalService,
    public customValidatorsService: CustomValidatorsService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public currentNodeIp: string;
  public nodeTiModal: any;
  public appParamsInfos: any;
  public processPidInfo: any;
  public nodeParamsChange: any;
  ngOnInit() {
    this.formGroup = new FormGroup({
      bs_path: new FormControl('', [this.customValidatorsService.pathValidator()]),
    });
  }

  public open(nodeParams: any) {
    this.nodeParams = nodeParams;
    const nodeConfigedData = this.nodeConfigList?.find((item: any) => {
      return item.nodeIp === nodeParams.nodeIp;
    });
    this.currentNodeIp = nodeConfigedData.nodeIp;
    this.appParamsInfos = nodeConfigedData.appParamsInfo;
    this.processPidInfo = nodeConfigedData.processPidInfo;
    this.formGroup.controls.bs_path.setValue(nodeConfigedData.assemblyLocation || '');
    setTimeout(() => {
      this.nodeTiModal = this.tiModal.open(this.nodeConfigModal, {
        modalClass: 'tuninghelperNodeConfig',
        draggable: false
      });
    }, 0);
  }
  public confirm(context: any) {
    this.nodeParamsChange.nodeIp = this.currentNodeIp;
    if (this.nodeParamsChange.appParam) {
      this.nodeParamsChange.appParam.assemblyLocation = this.formGroup.get('bs_path').value;
    }
    this.nodeParamsChange.assemblyLocation = this.formGroup.get('bs_path').value;
    this.handleConfigData.emit(this.nodeParamsChange);
    context.close();
  }

  public checkAppParamVaild(e: any) {
    this.appParamsValid = e === 'VALID' ? true : false;
  }
  public checkProcessPid(e: any) {
    this.processPidValid = e === 'VALID' ? true : false;
  }
  public getAppParamChange(data: any) {
    this.nodeParamsChange = data;
  }
}
