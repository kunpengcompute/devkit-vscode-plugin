import { Component, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TiValidationConfig } from '@cloud/tiny3';
import { I18nService } from '../service/i18n.service';
import { VscodeService, COLOR_THEME, currentTheme } from '../service/vscode.service';



/**
 * 当前状态
 */
const enum MESSAGE_MAP {
    SHOW_PROGRESS = 'getStatus',
    FILE_SIZE_EXCEEED = 'fileSizeExceed',
    FILE_UPLOAD = 'uploadFile',
    PROCESS_FAILED = 'processFailed'
}
export default MESSAGE_MAP;
/**
 * 状态
 */
export const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2
}

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss']
})

export class ImportComponent implements OnInit {
    form: FormGroup;
    firstform: FormGroup;

    public currTheme = COLOR_THEME.Dark;
    public i18n: any;
    public isShowProjectError = false;
    public isShowTaskError = false;
    public isShowUploadError = false;
    public isShowFilePathError = false;
    public msg: string;
    public localfilepath: any;
    public label: any;
    public currLang: any;
    public projectName: any;
    public taskName: any;
    public projectNameVerifyMsg: string;
    public taskNameVerifyMsg: string;
    public uploadVerifyMsg: string;
    public filePathVerifyMsg: string;
    public modeClicked = 0;
    public fileSavePath = null;
    public filePathList: any[] = [];
    public fileNameList = [];
    public assignFilePaths = [];
    public uploadFile = null;
    public uploadType: string;
    public isUploading = false; // 判断是否可上传文件
    public isUploadSuccess = false; // 是否上传成功
    public isShow = false;

    public uploadZipFile: any;
    public uploadProgress: any;
    public allFileSize = 0;

    public taskId: any;
    public uploadIndex: any;
    public uploadFileName: any;
    public uploadFileSize: any;
    // 文件名
    public exitFileName = '';

    public files: any; // 存放临时文件

    // 后缀
    public suffix = '';
    // 警示
    public exitFileNameReplace: string;
    // 控制exitFileNameReplace显示
    public uploadFolderFileList: any;
    public btnDisable = false;

    public importTaskForm = {
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
    public toolType = sessionStorage.getItem('toolType');
    constructor(
        private elementRef: ElementRef,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private changeDetectorRef: ChangeDetectorRef) {
        this.i18n = this.i18nService.I18n();
        this.currLang = I18nService.getLang();
    }


    /**
     * 组件初始化
     */
    ngOnInit() {

        // 导入任务
        this.importTaskForm.projectName.label = this.i18n.common_term_projiect_name;
        this.importTaskForm.projectName.placeholder = this.i18n.project.createImportTaskProjectPlaceholder;
        this.importTaskForm.taskName.label = this.i18n.common_term_task_name;
        this.importTaskForm.taskName.placeholder = this.i18n.project.createImportTaskTaskPlaceholder;
        this.importTaskForm.importMode.label = this.i18n.project.importMode;
        this.importTaskForm.importMode.list = [
            { label: this.i18n.project.uploadFile, value: 0 },
            { label: this.i18n.project.specifyFilePath, value: 1 },
        ];
        this.importTaskForm.uploadFile.label = this.i18n.project.uploadFile;
        this.importTaskForm.filePath.label = this.i18n.project.fileStoragePath;
        this.importTaskForm.filePath.placeholder = this.i18n.project.fileStoragePathPlaceholder;

        this.isShowProjectError = false;
        this.isShowTaskError = false;
        this.isShowUploadError = false;
        this.isShowFilePathError = false;
        this.projectNameVerifyMsg = '';
        this.taskNameVerifyMsg = '';
        this.uploadVerifyMsg = '';
        this.filePathVerifyMsg = '';

        this.uploadType = 'web';

        // vscode颜色主题
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.detectChanges();
            this.changeDetectorRef.checkNoChanges();
        }
    }

    /**
     * 工程名称校验
     */
    public priojectNameChange(projectName: string): string {
        projectName = projectName.trim();
        const reg = new RegExp(/^[\w\@\#\$\%\^\&\*\(\)\[\]\<\>\.\-\!\~\+\s]{1,32}$/);
        if (projectName && !reg.test(projectName)) {
            this.isShowProjectError = true;
            return this.projectNameVerifyMsg = this.i18n.common_term_projiect_name_tip;
        } else {
            this.isShowProjectError = false;
            return this.projectNameVerifyMsg = '';
        }
    }

    /**
     * 任务名称校验
     */
    public taskNameChange(taskName: string): string {
        taskName = taskName.trim();
        const reg = new RegExp('[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$');
        if (taskName && !reg.test(taskName)) {
            this.isShowTaskError = true;
            return this.taskNameVerifyMsg = this.i18n.validata.task_name_rule;
        } else {
            this.isShowTaskError = false;
            return this.taskNameVerifyMsg = '';
        }
    }

    /**
     * 文件存放路径校验
     */
    public filePathChange(e: any): string {
        const reg = /^([\/][^\/]+)*$/;
        if (!e) {
            this.isShowFilePathError = true;
            return this.filePathVerifyMsg = this.i18n.plugins_perf_tips_isRequired;
        } else if (!reg.test(e)) {
            this.isShowFilePathError = true;
            return this.filePathVerifyMsg = this.i18n.common_term_file_path_error;
        } else {
            this.isShowFilePathError = false;
            return this.filePathVerifyMsg = '';
        }
    }

    /**
     * 验证是否有上传文件
     */
    public uploadChange(e: any): string {
        if (!this.uploadFile) {
            this.isShowUploadError = true;
            return this.uploadVerifyMsg = this.i18n.project.uploadFileError;
        } else {
            this.isShowUploadError = false;
            return this.uploadVerifyMsg = '';
        }
    }

    /**
     * 选择导入模式
     */
    public onModeClick(index: number): void {
        // 切换分析对象时清理配置项
        this.filePathList = [];
        this.assignFilePaths = [];
        this.fileNameList = [];
        this.allFileSize = 0;
        this.uploadFile = null;
        this.fileSavePath = null;
        this.modeClicked = index;
        if (!this.modeClicked) {
            this.uploadType = 'web';
        } else {
            this.uploadType = 'server';
        }
    }


    /**
     * 确认导入
     */
    public toImportTask() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.intellijUpload();
            return;
        }
        this.elementRef.nativeElement.querySelector('#upload').value = '';
        this.elementRef.nativeElement.querySelector('#upload').click();
    }

    private intellijUpload() {
        const path = this.fileSavePath;
        const option = {
            url: 'checkUploadFileIntellijHyper',
            data: {
                validFile: '.tar$|.tar.gz$|.tar.bz$|.tar.bz2$|.tar.xz$',
                projectname: this.projectName,
                taskname: this.taskName,
                upload_type: this.uploadType,
                title: this.i18n.plugins_port_migration_appraise,
                uploadFilePath: path,
            }
        };
        this.vscodeService.post(option, (data: any) => {
            this.uploadIndex = data.id;
            this.uploadFileName = data.fileName;
            this.uploadFileSize = data.fileSize;
            this.uploadFile = data.filePath;
            this.isShowProjectError = false;
            this.isShowTaskError = false;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
    }

    private intellijExcuteUpload() {
        if (this.uploadType === 'server') {
            const option = {
                url: 'intellijExcuteUpload',
                data: {
                    projectname: this.projectName,
                    taskname: this.taskName,
                    upload_type: this.uploadType,
                    uploadFilePath: this.fileSavePath
                }
            };
            this.vscodeService.post(option, (data: any) => {

            });
        } else {
            const option = {
                url: 'intellijExcuteUpload',
                data: {
                    projectname: this.projectName,
                    taskname: this.taskName,
                    upload_type: this.uploadType,
                    uploadFilePath: this.uploadFile,
                    uploadFileName: this.uploadFileName,
                    uploadFileSize: this.uploadFileSize,
                }
            };
            this.vscodeService.post(option, (data: any) => {

            });
        }
    }

    /**
     * 上传压缩包文件
     */
    public toUploadFile(e, choice: string) {
        this.isShow = false;
        this.filePathList = [];
        this.assignFilePaths = [];
        this.fileNameList = [];
        this.allFileSize = 0;
        this.uploadFile = null;
        this.fileSavePath = null;
        this.uploadZipFile = '';
        let inputDom: any;
        let file: any;
        if (choice === 'normal') {
            inputDom = this.elementRef.nativeElement.querySelector('#upload');
            file = this.elementRef.nativeElement.querySelector('#upload').files[0];
            this.files = this.elementRef.nativeElement.querySelector('#upload').files;
            this.uploadZipFile = file;
        } else {
            file = this.uploadZipFile;
        }
        const tempFile = {
            filePath: '',
            fileName: '',
            fileSize: ''
        };
        let tempFile1 = null;
        for (const element of this.files) {
            tempFile.filePath = element.path;
            tempFile.fileName = element.name;
            tempFile.fileSize = element.size;
            tempFile1 = { ...tempFile };
            this.filePathList.push(tempFile1);
            // 获取上传的文件名
            this.fileNameList.push(element.name);
            this.allFileSize += element.size;
        }
        this.uploadFile = this.fileNameList.join(', ');
        if (!(/.tar$|.tar.gz$|.tar.bz$|.tar.bz2$|.tar.xz$/).test(file.name)) {
            this.showI18nInfoBox(this.i18n.project.wrongFileType, 'error');
            this.isUploading = false;
            return;
        }
        const size = this.allFileSize / 1024 / 1024;
        if (size > 1024) {
            this.isShow = false;
            this.showI18nInfoBox(this.i18n.project.fileExceedMaxSize, 'error');
            this.isUploading = false;
            return;
        }
        inputDom.value = '';
    }


    /**
     * 点击确认导入
     */
    public sureImportTask() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.intellijExcuteUpload();
            return;
        }
        if (this.uploadType === 'server') {
            let tempFile2 = null;
            const tempFile = {
                filePath: '',
                fileName: '',
                fileSize: ''
            };
            const filepaths: Array<any> = this.fileSavePath.split(',');
            filepaths.forEach(item => {
                tempFile.filePath = item;
                tempFile2 = JSON.parse(JSON.stringify(tempFile));
                this.assignFilePaths.push(tempFile2);
            });
        }
        const params = {
            uploadPath: this.uploadType,
            projectname: this.projectName,
            taskname: this.taskName,
            fileList: this.uploadType === 'web' ? this.filePathList : this.assignFilePaths
        };
        const message = {
            cmd: 'importFileTask',
            data: {
                operate: 'import',
                toolType: this.toolType,
                params,
            }
        };
        this.vscodeService.postMessage(message, null);
        this.filePathList = [];
        this.assignFilePaths = [];
        this.uploadFile = null;
    }

    /**
     * 取消关闭panel
     */
    public cancelOperation() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            // 关闭当前页面
            this.vscodeService.showTuningInfo('cancel', 'info', 'importTask');
        } else {
            const message = {
                cmd: 'closePanel',
                module: VscodeService.PERF_SUBMODULE.TOOL_SYSPERF_ADVISOR
            };
            this.vscodeService.postMessage(message, null);
        }
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     */
    public showI18nInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 发送消息给vscode, 右下角弹出带按钮的提醒框
     */
    public showInfoBoxWithButton(tips: any, showtype: any, title: any) {
        const message = {
            cmd: 'showInfoBoxWithButton',
            data: {
                info: tips,
                type: showtype,
                title,
            }
        };
        this.vscodeService.postMessage(message, {});
    }

    /**
     * 错误提示处理
     * @param data 错误信息
     */
    showErrMsg(data: any) {
        this.msg = data.message;
    }

    /**
     * 错误提示处理
     * @param data 错误信息
     */
    showPwdErrMsg(data: any) {
        this.msg = data.message;
    }
}

