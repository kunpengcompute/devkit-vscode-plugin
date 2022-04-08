import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { HttpService, I18nService, CustomValidatorsService, TipService } from 'sys/src-com/app/service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tuninghelper-create-project',
  templateUrl: './tuninghelper-create-project.component.html',
  styleUrls: ['./tuninghelper-create-project.component.scss']
})
export class TuninghelperCreateProjectComponent implements OnInit {
  @Input()
  set currentTool(value: string) {
    this.alertTipBox = value;
  }
  @Output() createdProject = new EventEmitter<any>();
  @Output() jumpToNodeManage = new EventEmitter<any>();
  @Output() private closeTab = new EventEmitter<any>();
  public i18n: any;
  constructor(
    public i18nService: I18nService,
    public http: HttpService,
    public customValidatorsService: CustomValidatorsService,
    public mytip: TipService,
    public router: Router,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public labelWidth = '120px';
  public role: string;
  public projectInfoFormGroup: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public selectedNodeIds: number[] = [];
  public selectMode = 'checkbox';
  public tableWidth = '600px';
  public projectName = '';
  public alertTipBox: string;
  ngOnInit(): void {
    this.role = sessionStorage.getItem('role');
    this.projectInfoFormGroup = new FormBuilder().group({
      projectName: new FormControl('', [this.customValidatorsService.checkEmpty(),
      this.customValidatorsService.projectNameValidator, TiValidators.required]),
      selectedNodeIds: new FormControl([], TiValidators.required),
    });
  }
  public selectedNodeIdsChange(value: number[] = []) {
    this.selectedNodeIds = value;
    this.projectInfoFormGroup.get('selectedNodeIds').setValue(value.length ? value : null);
  }
  public createProject() {
    const params = {
      projectName: this.projectInfoFormGroup.get('projectName').value.trim(),
      nodeList: this.selectedNodeIds,
      sceneId: 11,
      analysisType: 'optimization'
    };
    this.http.post('/projects/', params).then((data: any) => {
      if (data?.code === 'SysPerf.Success') {
        if (this.alertTipBox === 'popTip') {
          this.createdProject.emit({ type: 'info', msg: data.data?.projectName });
        } else {
          this.mytip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.add_ok,
            time: 3500
          });
          this.closeTab.emit({
            type: 'tuningAssistantProjectSuccess'
          });
        }
      }
    }).catch((e: any) => {
      this.createdProject.emit({ type: 'error', msg: e.message });
    });
  }

  public cancalCreate() {
    this.createdProject.emit(false);
    this.closeTab.emit({});
  }
  public onBlur(e: string) {
    this.projectName = e.trim();
  }
  public linkTo() {
    if (this.alertTipBox === 'popTip') {
      this.jumpToNodeManage.emit(true);
    } else {
      this.router.navigate(['/nodeManagement/nodeManagement']);
    }
  }
}
