import { Component, OnInit, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { TiModalService, TiValidationConfig } from '@cloud/tiny3';

import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { UserGuideService } from 'projects/sys/src-web/app/service/user-guide.service';
import { CustomValidatorsService } from 'projects/sys/src-web/app/service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { OpenType, SceneAddress } from './domain';
import { Subscription } from 'rxjs';
import * as Util from 'projects/sys/src-web/app/util';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { ToolType } from 'projects/domain';
import { GetTreeService } from '../service/get-tree.service';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})

export class AddProjectComponent implements OnInit, OnDestroy {
  constructor(
    private tiModal: TiModalService,
    public i18nService: I18nService,
    public Axios: AxiosService,
    public mytip: MytipService,
    public msg: MessageService,
    public userGuide: UserGuideService,
    public customValidatorsService: CustomValidatorsService,
    public getTreeService: GetTreeService,
    private urlService: UrlService
  ) {
    this.toolUrl = this.urlService.Url();
    this.i18n = this.i18nService.I18n();
    this.validation.errorMessage.required = this.i18n.common_term_projiect_name_null;
  }
  static MAX_NODE_ALLOW = 101;
  @Output() newProjectSuccessfully = new EventEmitter();
  @Output() modifyProjectSuccessfully = new EventEmitter();

  @ViewChild('myModal') myModal: any;
  public i18n: any;
  public role: string;
  private language: string;
  public userGuideStep: Subscription;
  public validation: TiValidationConfig = { // [tiValidation]='validation' ????????????????????????
    type: 'blur',
    errorMessage: {
      required: ''
    }
  };

  public modal: any;
  /** ???????????? */
  public openType: OpenType;
  /** ???????????? */
  public modalTitle: any;
  /** ???????????????Id */
  public projectId: number;
  /** ????????????????????? */
  public projectName: string;
  /** ??????????????????????????????????????? */
  public selectedNodeIds: number[] = [];
  /** HPC??????????????? */
  public selectedNodeId: number[] = [];

  /** ?????????????????? */
  public projectInfoFormGroup: FormGroup;
  /** ??????????????????ID????????????????????????????????? */
  public sceneAddressList: SceneAddress = {};
  /** ???????????? */
  public sceneList: any[] = [];
  /** ???????????? */
  public currentScene: any = {};
  private predefinedSceneInfo: {
    [propName: number]: {
      prop: string, // ??????????????????
      order: number,  // ??????????????????????????????????????????????????????order????????????
      info: string, // ????????????
      imgPath_normal: string, // ????????????
      imgPath_hover: string,  // ????????????
      imgPath_disbale: string,  // ????????????
    }
  } = {};
  /** ?????????-???????????? */
  public componentList: any[] = [];
  /** ?????????-?????????????????? */
  public applicationScenarioList: any[] = [];
  /** ???????????????-?????????????????? */
  public storageTypeList: any[] = [];
  /** ???????????????-???????????????????????? */
  public storageTypeDetailList: any[] = [];
  /** ?????????-???????????? */
  public databaseTypeList: any[] = [];
  /** ?????????????????? */
  public isDiagnose = false;
  private url = '/projects/';
  public toolUrl: any;
  private isFirstChange = true;

  ngOnInit() {
    this.isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
    if (this.isDiagnose) {
      this.url = this.urlService.Url().project;
    }
    this.role = sessionStorage.getItem('role');
    this.language = sessionStorage.getItem('language') === 'en-us' ? 'en' : 'zh';

    this.initPredefinedSceneInfo();
    if (!this.isDiagnose) {
      this.getScene();
    }

    this.initProjectInfoFormGroup();
    this.userGuideStep = this.userGuide.userGuideStep.subscribe((str) => {
      switch (str) {
        case 'user-guide-add-project':
          this.showModalToCreateProject();
          break;
        case 'select-project-scene':
          const selectSeenes = document.querySelector('#addProjectContent');
          const scrHeight = selectSeenes.scrollHeight;
          selectSeenes.scrollTop = scrHeight;
          this.userGuide.showMask('select-project-node', 'id');
          this.getNodes();
          break;
        case 'select-project-node':
          this.userGuide.showMask('create-project-sure', 'id');
          break;
        case 'create-project-sure':
          this.newProject({});
          break;
        default: break;
      }
    });
  }

  /**
   * ??????????????????????????????
   */
  public async getNodes() {
    const params = {
      'auto-flag': 'off',
      page: 1,
      'per-page': AddProjectComponent.MAX_NODE_ALLOW
    };

    const selectAllNodeList: any[] = [];
    const res = await this.Axios.axios.get(this.toolUrl.nodes, { params });
    const data = res.data.nodeList;
    data.forEach((val: { nodeStatus: string; id: any; }) => {
      if (val.nodeStatus === 'on') {
        selectAllNodeList.push(val.id);
      }
    });
    this.selectedNodeIdsChange(selectAllNodeList);
  }
  // -- ???????????? --
  /**  */
  private initPredefinedSceneInfo() {
    this.predefinedSceneInfo[1] = { // ???????????????
      prop: 'distributed_storage',
      order: 2,
      info: this.i18n.project.distributedStorageInfo,
      imgPath_normal: './assets/img/home/distributedStorage_normal.svg',
      imgPath_hover: './assets/img/home/distributedStorage_hover.svg',
      imgPath_disbale: './assets/img/home/distributedStorage_disable.svg',
    };

    this.predefinedSceneInfo[11] = { // ????????????
      prop: 'general_scenario',
      order: 0,
      info: this.i18n.project.generalScenarioInfo,
      imgPath_normal: './assets/img/home/generalScenario_normal.svg',
      imgPath_hover: './assets/img/home/generalScenario_hover.svg',
      imgPath_disbale: './assets/img/home/generalScenario_disable.svg',
    };

    this.predefinedSceneInfo[101] = { // ?????????
      prop: 'big_data',
      order: 1,
      info: this.i18n.project.bigDataInfo,
      imgPath_normal: './assets/img/home/bigData_normal.svg',
      imgPath_hover: './assets/img/home/bigData_hover.svg',
      imgPath_disbale: './assets/img/home/bigData_disable.svg',
    };

    this.predefinedSceneInfo[201] = { // HPC
      prop: 'HPC',
      order: 3,
      info: this.i18n.project.HPCInfo,
      imgPath_normal: './assets/img/home/HPC_normal.svg',
      imgPath_hover: './assets/img/home/HPC_hover.svg',
      imgPath_disbale: './assets/img/home/HPC_disable.svg',
    };

    this.predefinedSceneInfo[401] = { // ?????????
      prop: 'database',
      order: 4,
      info: this.i18n.project.databaseInfo,
      imgPath_normal: './assets/img/home/database_normal.svg',
      imgPath_hover: './assets/img/home/database_hover.svg',
      imgPath_disbale: './assets/img/home/database_disable.svg',
    };
  }

  /**
   * ???????????????????????????
   * @param sceneList ???????????????????????????
   */
  private initSceneList(sceneList: any[]) {
    this.getTreeService.sceneInfo = sceneList;
    this.sceneList = sceneList.map((sceneInfo, index) => {
      const predefinedSceneInfo = this.predefinedSceneInfo[sceneInfo.Id];

      this.sceneAddressList[sceneInfo.Id] = { sceneId: sceneInfo.Id };
      if (predefinedSceneInfo && predefinedSceneInfo.prop === 'big_data') { this.initBigDataScene(sceneInfo); }
      if (predefinedSceneInfo && predefinedSceneInfo.prop === 'distributed_storage') {
        this.initDistributedStorageScene(sceneInfo); }
      if (predefinedSceneInfo && predefinedSceneInfo.prop === 'database') {
        sceneInfo.sceneNameEn = 'Database';
        this.initDatabase(sceneInfo);
      }

      return {
        label: this.language === 'en' ? sceneInfo.sceneNameEn : sceneInfo.sceneName,
        value: sceneInfo.Id,
        prop: predefinedSceneInfo ? predefinedSceneInfo.prop : sceneInfo.sceneNameEn,
        order: predefinedSceneInfo ? predefinedSceneInfo.order : index,
        info: predefinedSceneInfo ? predefinedSceneInfo.info : '',
        imgPath_normal: predefinedSceneInfo ? predefinedSceneInfo.imgPath_normal : '',
        imgPath_hover: predefinedSceneInfo ? predefinedSceneInfo.imgPath_hover : '',
        imgPath_disbale: predefinedSceneInfo ? predefinedSceneInfo.imgPath_disbale : '',
      };
    }).sort((a: any, b: any) => a.order - b.order);
  }

  /**
   * ????????????????????????
   * @param sceneInfo ????????????????????????????????????
   */
  private initBigDataScene(sceneInfo: any) {
    this.componentList = sceneInfo.children.map((component: any) => {
      const applicationScenarioList = component.children[0].map((item: any) => {
        this.sceneAddressList[item.Id] = {
          sceneId: sceneInfo.Id,
          componentId: component.Id,
          applicationScenarioId: item.Id,
        };

        return {
          label: this.language === 'en' ? item.sceneNameEn : item.sceneName,
          value: item.Id,
        };
      });

      this.sceneAddressList[component.Id] = {
        sceneId: sceneInfo.Id,
        componentId: component.Id,
      };

      return {
        label: this.language === 'en' ? component.sceneNameEn : component.sceneName,
        value: component.Id,
        _children: applicationScenarioList, // tiny??????children??????????????????
      };
    });
  }

  /**
   * ??????????????????????????????
   * @param sceneInfo ??????????????????????????????????????????
   */
  private initDistributedStorageScene(sceneInfo: any) {
    this.storageTypeList = sceneInfo.children.map((component: any) => {
      const storageTypeDetailList = component.children[0].map((item: any) => {
        this.sceneAddressList[item.Id] = {
          sceneId: sceneInfo.Id,
          storageTypeId: component.Id,
          storageTypeDetailId: item.Id,
        };

        return {
          label: this.language === 'en' ? item.sceneNameEn : item.sceneName,
          value: item.Id,
        };
      });

      this.sceneAddressList[component.Id] = {
        sceneId: sceneInfo.Id,
        storageTypeId: component.Id,
      };

      return {
        label: this.language === 'en' ? component.sceneNameEn : component.sceneName,
        value: component.Id,
        _children: storageTypeDetailList, // tiny??????children??????????????????
      };
    });
  }

  /**
   * ????????????????????????
   * @param sceneInfo ????????????????????????????????????
   */
  private initDatabase(sceneInfo: any) {
    this.databaseTypeList = sceneInfo.children.map((databaseType: any) => {
      this.sceneAddressList[databaseType.Id] = {
        sceneId: sceneInfo.Id,
        databaseTypeId: databaseType.Id,
      };
      return {
        label: this.language === 'en' ? databaseType.sceneNameEn : databaseType.sceneName,
        value: databaseType.Id,
      };
    });
  }

  /** ???????????????????????? */
  private getScene() {
    this.Axios.axios.get('/projects/scene/').then((res: any) => {
      this.initSceneList(res.data.data);
    });
  }


  // -- ?????????????????? --
  /** ??????????????????????????? */
  private initProjectInfoFormGroup() {
    this.projectInfoFormGroup = new FormBuilder().group({
      projectName: new FormControl('', [this.customValidatorsService.projectNameValidator, TiValidators.required]),
      scene: new FormControl('', TiValidators.required),
      component: new FormControl('', TiValidators.required),
      applicationScenario: new FormControl('', TiValidators.required),
      storageType: new FormControl('', TiValidators.required),
      storageTypeDetail: new FormControl('', TiValidators.required),
      selectedNodeIds: new FormControl([], TiValidators.required),
      selectedNodeId: new FormControl(null, TiValidators.required),
      databaseType: new FormControl('', TiValidators.required),
    });
    if (this.isDiagnose) {
      this.projectInfoFormGroup.get('scene').disable({ emitEvent: false });
      this.projectInfoFormGroup.get('component').disable({ emitEvent: false });
      this.projectInfoFormGroup.get('applicationScenario').disable({ emitEvent: false });
      this.projectInfoFormGroup.get('storageType').disable({ emitEvent: false });
      this.projectInfoFormGroup.get('storageTypeDetail').disable({ emitEvent: false });
      this.projectInfoFormGroup.get('selectedNodeId').disable({ emitEvent: false });
      this.projectInfoFormGroup.get('databaseType').disable({ emitEvent: false });
    }
    this.listeningSceneChange();
    this.listeningComponentChange();
    this.listeningStorageTypeChange();
  }

  /** ???????????????????????? */
  private listeningSceneChange() {
    const formGroup = this.projectInfoFormGroup;

    formGroup.get('scene').valueChanges.subscribe((val: string) => {
      if (val && val !== this.currentScene.value) {
        const scene = this.sceneList.find((item: any) => item.value === val);

        formGroup.get('component').disable({ emitEvent: false });
        formGroup.get('applicationScenario').disable({ emitEvent: false });
        formGroup.get('storageType').disable({ emitEvent: false });
        formGroup.get('storageTypeDetail').disable({ emitEvent: false });
        formGroup.get('selectedNodeIds').disable({ emitEvent: false });
        formGroup.get('selectedNodeId').disable({ emitEvent: false });
        formGroup.get('databaseType').disable({ emitEvent: false });

        if (scene.prop === 'big_data') {
          formGroup.get('component').enable({ emitEvent: false });
          formGroup.get('applicationScenario').enable({ emitEvent: false });
        } else if (scene.prop === 'distributed_storage') {
          formGroup.get('storageType').enable({ emitEvent: false });
          formGroup.get('storageTypeDetail').enable({ emitEvent: false });
        } else if (scene.prop === 'database') {
          formGroup.get('databaseType').enable({ emitEvent: false });
        }
        if (scene.prop === 'HPC') {
          formGroup.get('selectedNodeId').enable({ emitEvent: false });
          if (this.isFirstChange){
            this.getNodes();
            this.isFirstChange = false;
          }
        } else {
          formGroup.get('selectedNodeIds').enable({ emitEvent: false });
        }
        this.currentScene = scene;
      }
    });
  }

  /** ???????????????-???????????? */
  private listeningComponentChange() {
    const formGroup = this.projectInfoFormGroup;

    formGroup.get('component').valueChanges.subscribe((val: any) => {
      if (val) {
        formGroup.get('applicationScenario').reset();
        this.applicationScenarioList = val._children;
        formGroup.get('applicationScenario').setValue(this.applicationScenarioList[0]);
      }
    });
  }

  /** ?????????????????????-?????????????????? */
  private listeningStorageTypeChange() {
    const formGroup = this.projectInfoFormGroup;

    formGroup.get('storageType').valueChanges.subscribe((val: any) => {
      if (val) {
        formGroup.get('storageTypeDetail').reset();
        this.storageTypeDetailList = val._children;
        formGroup.get('storageTypeDetail').setValue(this.storageTypeDetailList[0]);
      }
    });
  }

  /**
   * ?????????????????????????????????????????????
   * @param value value
   */
  public selectedNodeIdsChange(value: number[] = []) {
    if (this.currentScene.prop === 'HPC') {
      this.selectedNodeId = value;
      this.projectInfoFormGroup.get('selectedNodeId').setValue(value.length ? value : null);
    } else {
      this.selectedNodeIds = value;
      this.projectInfoFormGroup.get('selectedNodeIds').setValue(value.length ? value : null);
    }
  }

  /**
   * ??????????????????
   * @param projectName ?????????????????????
   * @param sceneId ???????????????Id
   * @param selectedNodeList selectedNodeList???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
   */
  private resetProjectInfoFormGroup(projectName?: string, sceneId?: number, selectedNodeList?: number[]) {
    const formGroup = this.projectInfoFormGroup;
    formGroup.reset({ projectName });
    if (selectedNodeList) {
      this.selectedNodeIdsChange(selectedNodeList);
    } else {
      this.selectedNodeIdsChange([]);
    }
    if (this.isDiagnose) { return; }

    if (sceneId === undefined) { sceneId = this.sceneList[0]?.value; }
    const sceneAddress = this.sceneAddressList[sceneId];
    const sceneInfo = this.sceneList.find((item: any) => item.value === sceneAddress.sceneId);
    formGroup.get('scene').setValue(sceneAddress.sceneId);

    if (sceneInfo.prop === 'big_data') {
      const component = this.componentList.find(item => item.value === sceneAddress.componentId);
      if (component) { formGroup.get('component').setValue(component); }

      const applicationScenario = this.applicationScenarioList
        .find(item => item.value === sceneAddress.applicationScenarioId);
      if (applicationScenario) { formGroup.get('applicationScenario').setValue(applicationScenario); }
    } else if (sceneInfo.prop === 'distributed_storage') {
      const storageType = this.storageTypeList.find(item => item.value === sceneAddress.storageTypeId);
      if (storageType) { formGroup.get('storageType').setValue(storageType); }

      const storageTypeDetail = this.storageTypeDetailList
        .find(item => item.value === sceneAddress.storageTypeDetailId);
      if (storageTypeDetail) { formGroup.get('storageTypeDetail').setValue(storageTypeDetail); }
    } else if (sceneInfo.prop === 'database') {
      const databaseType = this.databaseTypeList.find(item => item.value === sceneAddress.databaseTypeId);
      if (databaseType) { formGroup.get('databaseType').setValue(databaseType); }
    }
  }


  /** ?????????????????????????????????????????????????????? */
  public showModalToCreateProject() {
    this.openType = 'create';
    this.modalTitle = this.i18n.project.newPro;
    this.isFirstChange = true;
    this.resetProjectInfoFormGroup();
    // user-guide ?????????????????? esc ?????????????????? ????????? x ??????
    if (sessionStorage.getItem('userGuidStatus-sys-perf') === '0') {

      // ?????????????????????????????????????????????????????????
      const MutationObserver = (window as any).MutationObserver || (window as any).WebKitMutationObserver
        || (window as any).MozMutationObserver;
      let observer: any;

      // ????????????
      const clearObserver = () => {
        if (observer) {
          observer.disconnect();
          observer.takeRecords();
          observer = null;
        }
      };

      this.modal = this.tiModal.open(this.myModal, {
        id: 'myModal', // ??????id??????????????????????????????????????????
        modalClass: 'projectManagementModal custemModal',
        closeOnEsc: false,
        closeIcon: true,
        draggable: true,
        close: (): void => {
          clearObserver();
        },
        dismiss: (): void => {
          clearObserver();
        },
      });

      // ??????tiModal???????????????????????????????????????????????????
      setTimeout(() => {
        this.userGuide.showMask('input-project-name', 'id');
        const time = Util.dateFormat(new Date(), 'yyyyMMdd_hhmmss');
        this.projectInfoFormGroup.controls.projectName.setValue('Project_Demo_' + time);
        sessionStorage.setItem('userGuideProject', 'Project_Demo_' + time);
      }, 10);

    } else {
      this.modal = this.tiModal.open(this.myModal, {
        id: 'myModal', // ??????id??????????????????????????????????????????
        modalClass: 'projectManagementModal custemModal',
      });
    }
  }

  /** ?????????????????????????????????????????????????????? */
  public showModalToEditProject({ projectName, projectId, sceneId, selectedNodeList }: {
    projectName: string,  // ????????????
    projectId: number,  // ??????Id
    sceneId: number,  // ??????Id
    selectedNodeList: number[], // ?????????????????????
  }) {
    this.openType = 'edit';
    this.modalTitle = this.i18n.project.modifyPro;
    this.projectName = projectName;
    this.projectId = projectId;

    this.resetProjectInfoFormGroup(projectName, sceneId, selectedNodeList);

    this.modal = this.tiModal.open(this.myModal, {
      id: 'myModal', // ??????id??????????????????????????????????????????
      modalClass: 'projectManagementModal custemModal',
    });
  }

  /** ???????????????????????????????????????????????? */
  public showModalToShowProjectInfo({ projectName, sceneId, nodeList }: {
    projectName: string,  // ????????????
    sceneId: number,  // ??????Id
    nodeList: object[], // ????????????
  }) {
    this.openType = 'showProjectInfo';
    this.modalTitle = this.i18n.project.projectInformation;

    this.resetProjectInfoFormGroup(projectName, sceneId);

    this.modal = this.tiModal.open(this.myModal, {
      id: 'nodeListModal', // ??????id??????????????????????????????????????????
      modalClass: 'projectManagementModal custemModal showInfo',
      context: {
        nodeList,
      }
    });
  }

  /**
   * ????????????/????????????
   * @param context context
   */
  public newProject(context: any) {
    context.interfacing = true;
    const formGroup = this.projectInfoFormGroup;

    const scene = this.currentScene;
    let sceneId;

    if (scene.prop === 'big_data') {
      sceneId = formGroup.get('applicationScenario').value.value;
    } else if (scene.prop === 'distributed_storage') {
      sceneId = formGroup.get('storageTypeDetail').value.value;
    } else if (scene.prop === 'database') {
      sceneId = formGroup.get('databaseType').value.value;
    } else {
      sceneId = scene.value;
    }
    const params = {
      projectName: formGroup.get('projectName').value,
      nodeList: this.currentScene.prop === 'HPC'
        ? formGroup.get('selectedNodeId').value : formGroup.get('selectedNodeIds').value,
      sceneId,
    };

    if (this.openType === 'create') {
      this.Axios.axios.post(this.url, params).then((data: any) => {
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.add_ok,
          time: 3500
        });

        this.newProjectSuccessfully.emit(params.projectName);
        this.modal.close();
      }).catch((e: any) => {
        context.interfacing = false;
      });
    } else if (this.openType === 'edit') {
      this.Axios.axios.put(`${this.toolUrl.project}${this.projectId}/`, params).then((data: any) => {
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500
        });

        this.modifyProjectSuccessfully.emit({
          projectId: this.projectId,
          projectName: params.projectName
        });

        this.modal.close();
        this.msg.sendMessage({
          function: 'updateTabProjectName',
          oldName: this.projectName,
          newName: params.projectName
        });
      }).catch((e: any) => {
        context.interfacing = false;
      });
    }
  }

  public trimProjectName() {
    this.projectInfoFormGroup.controls.projectName.setValue(this.projectInfoFormGroup.value.projectName.trim());
  }

  ngOnDestroy() {
    if (this.userGuideStep) {
      this.userGuideStep.unsubscribe();
    }
  }
}
