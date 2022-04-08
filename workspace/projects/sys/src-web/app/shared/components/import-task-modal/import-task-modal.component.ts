// 导入任务子组件
import { Component, OnInit, ViewChild,  } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { TiModalService, TiValidators, TiValidationConfig, TiModalRef } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TaskListInterfaceService } from 'projects/sys/src-web/app/service/task-list-interface.service';
import { CustomValidatorsService } from 'projects/sys/src-web/app/service';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-import-task-modal',
  templateUrl: './import-task-modal.component.html',
  styleUrls: ['./import-task-modal.component.scss']
})
export class ImportTaskModalComponent implements OnInit {
  @ViewChild('importTaskModalComponent') importTaskModalComponent: any;

  public i18n: any;
  public importTaskModal: any;
  public importTaskForm: any = {
    projectName: {  // 工程名称
      label: '',
      required: false,
      placeholder: '',
    },
    taskName: { // 任务名称
      label: '',
      required: false,
      placeholder: '',
    },
    importMode: { // 导入模式
      label: '',
      required: false,
      list: [],
    },
    uploadFile: { // 上传文件
      label: '',
      required: true,
      placeholder: '',
    },
    filePath: { // 文件存放路径
      label: '',
      required: true,
      placeholder: '',
    },
  };
  public validation: TiValidationConfig = { // [tiValidation]='validation' 可以更改提示规则
    type: 'blur'
  };
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  constructor(
    public i18nService: I18nService,
    private taskListInterface: TaskListInterfaceService,
    private tiModal: TiModalService,
    private customValidators: CustomValidatorsService,
    public timessage: MessageModalService,
  ) {
    this.i18n = this.i18nService.I18n();

    // 导入任务
    this.importTaskForm.projectName.label = this.i18n.common_term_projiect_name;
    this.importTaskForm.projectName.placeholder = this.i18n.project.createImportTaskProjectPlaceholder;
    this.importTaskForm.taskName.label = this.i18n.common_term_task_name;
    this.importTaskForm.taskName.placeholder = this.i18n.project.createImportTaskTaskPlaceholder;
    this.importTaskForm.importMode.label = this.i18n.project.importMode;
    this.importTaskForm.importMode.list = [
      { label: this.i18n.project.uploadFile, value: 'web' },
      { label: this.i18n.project.specifyFilePath, value: 'server' },
    ];
    this.importTaskForm.uploadFile.label = this.i18n.project.uploadFile;
    this.importTaskForm.filePath.label = this.i18n.project.fileStoragePath;
    this.importTaskForm.filePath.placeholder = this.i18n.project.fileStoragePathPlaceholder;
  }

  ngOnInit() {
  }

  /**
   * 导入任务【点击工程管理上面的导入任务】【点击任务列表的重试(文件未上传成功)】
   * @param projectName 工程名称
   * @param taskName 任务名称
   */
  public open(projectName?: any, taskName?: any) {
    const formGroup = new FormBuilder().group({
      projectName: new FormControl(projectName, [this.customValidators.projectNameValidator]),
      taskName: new FormControl(taskName, [this.customValidators.taskNameValidator]),
      importMode: new FormControl('web'),
      uploadFile: new FormControl(null, TiValidators.required),
      filePath: new FormControl(null, [
        this.customValidators.checkEmpty(),
        this.customValidators.checkFilePath()
      ]),
    });
    formGroup.get('filePath').disable();

    this.importTaskModal = this.tiModal.open(this.importTaskModalComponent, {
      id: 'importTaskModal', // 定义id防止同一页面出现多个相同弹框
      modalClass: 'custemModal',
      context: {
        formGroup,
        files: [],
        interfacing: false, // 调用接口中需要禁用掉按钮，防止点两次
        handleInputModeChange: (e: any, context: any) => { // 导入模式变化
          if (e === 'web') {
            context.formGroup.get('uploadFile').enable();
            context.formGroup.get('filePath').disable();
          } else if (e === 'server') {
            context.formGroup.get('uploadFile').disable();
            context.formGroup.get('filePath').enable();
          }
        },
        handleFileChange: (e: any, context: any) => { // 选择文件
          const files = e.target.files;
          context.formGroup.get('uploadFile').reset();
          if (!files || !files.length) { return; }
          context.files = files;
          context.formGroup.get('uploadFile').setValue(Object.keys(files).map((key: any) => files[key].name).join(';'));
        },
        confirm: (context: any) => {  // 点击确定
          this.timessage.open({ // 二次确认
            modalClass: 'custemMessage prompt',
            type: 'prompt',
            title: this.i18n.importAndExportTask.ensureImport.title,
            content: this.i18n.importAndExportTask.ensureImport.tip,
            okButton: {
              text: this.i18n.importAndExportTask.ensureImport.confirmText,
            },
            close: (messageRef: TiModalRef): void => {
              const value = context.formGroup.value;
              const params: any = {
                project_name: value.projectName || undefined,
                task_name: value.taskName || undefined,
                upload_type: value.importMode,
              };
              if (this.isDiagnose){
                params.analysisType = 'memory_diagnostic';
              }
              if (value.importMode === 'web') {
                params.section_qty = context.files.length;
                params.task_filesize = Object.keys(context.files).reduce(
                  (total, current: any) => total += context.files[current].size, 0
                );
              } else if (value.importMode === 'server') {
                params.file_path = value.filePath;
              }

              this.taskListInterface.createImportTask(params, context.files).then((res: any) => {
                context.dismiss();
              });
            },
          });
        },
      },
    });
  }

  /**
   * 用重试的方式打开，只支持修改工程名和任务名【点击导入/导出任务列表的重试按钮】【点击任务列表的重试(文件已上传成功)】
   * @param filePath 文件存放路径
   * @param taskId 任务id
   * @param projectname 工程名
   * @param taskname 任务名
   */
  public openByRetry(filePath: any, taskId: any, projectname: any, taskname: any) {
    return new Promise((resolve, reject) => {
      const formGroup = new FormBuilder().group({
        projectName: new FormControl(projectname, [this.customValidators.projectNameValidator]),
        taskName: new FormControl(taskname, [this.customValidators.taskNameValidator]),
      });

      this.importTaskModal = this.tiModal.open(this.importTaskModalComponent, {
        id: 'importTaskModal', // 定义id防止同一页面出现多个相同弹框
        modalClass: 'custemModal',
        context: {
          formGroup,
          interfacing: false, // 调用接口中需要禁用掉按钮，防止点两次
          retry: true,
          confirm: (context: { formGroup: any; dismiss: () => void; }) => {  // 点击确定
            const value = context.formGroup.value;
            const params: any = {
              project_name: value.projectName || projectname || undefined,
              task_name: value.taskName || taskname || undefined,
              file_path: filePath,
              id: taskId,
            };
            if (this.isDiagnose){
                params.analysisType = 'memory_diagnostic';
            }
            this.taskListInterface.createImportTask(params).then((res: any) => {
              context.dismiss();
              resolve(res);
            }).catch(e => {
              reject(e);
            });
          },
        },
      });
    });
  }

  public trimProjectName(formGroup: FormGroup) {
    formGroup.controls.projectName.setValue(formGroup.value.projectName.trim());
  }
  public trimTaskName(formGroup: FormGroup) {
    formGroup.controls.taskName.setValue(formGroup.value.taskName.trim());
  }
}
