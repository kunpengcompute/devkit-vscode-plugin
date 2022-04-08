import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import {
  PortWorkerStatusService, AxiosService, MytipService,
  I18nService, MessageService, CommonService, ReportService
} from '../../../service';

@Component({
    selector: 'app-creating-result',
    templateUrl: './creating-result.component.html',
    styleUrls: ['./creating-result.component.scss']
})
export class CreatingResultComponent implements OnInit, OnChanges {

    @Input() resultList: any;
    @Input() len: any;
    @Input() bottom: any;
    @Input() bcFileRes: any;
    @Input() bcFileResult: any;
    @Input() bcResultPartial: any;
    @Output() resultOptions = new EventEmitter();

    public i18n: any;
    public currentLang = 'zh-cn';
    public status = {
        comNoPerMission: '0x0c0317', // 扫描文件或文件夹无权限
        noPerMission: '0x050414',  // 扫描文件或文件夹无权限
        yumFailed: '0x0d0604' // 专项软件迁移yum运行失败
    };
    public bcFileTableData: Array<TiTableRowData> = [];
    public bcFileSrcData: TiTableSrcData;
    public bcFileColumns: Array<TiTableColumns>;
    public sourceCodeReport = false;
    public tempResult: any;
    constructor(
        private Axios: AxiosService,
        private myTip: MytipService,
        private i18nService: I18nService,
        private msgService: MessageService,
        private commonService: CommonService,
        private reportService: ReportService,
        public portWorkerStatusService: PortWorkerStatusService
    ) {
        this.i18n = this.i18nService.I18n();
        this.currentLang = sessionStorage.getItem('language');
        this.srcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.bcFileColumns = [
            {
                title: this.i18n.check_weak.bc_result.filename,
                width: '40%'
            },
            {
                title: this.i18n.check_weak.bc_result.scan_result,
                width: '40%'
            },
            {
                title: this.i18n.check_weak.bc_result.hand_suggesst,
                width: '20%'
            }
        ];
    }

    public resultListBak: any = [];
    public stopConfirmList: any = [];
    public isSelectAll = true;
    public byteSituation = {
        none: 9,
    };
    public displayed: Array<TiTableRowData> = [];
    public srcData: TiTableSrcData;
    public columns: Array<TiTableColumns> = [
        {
            title: '',
            width: '55%'
        },
        {
            title: '',
            width: '45%'
        }
    ];

    private downloadCount = 0; // 构建失败时下载软件包，记录下载次数
    private isFileDownload = false; // 记录迁移文件是否被下载

    ngOnInit() {
        if (this.bcFileRes) {
          if (this.bcFileRes.data.length > 0) {
            const bcRes = this.linePortingLevel(this.bcFileRes.data);
            this.bcFileRes.data = bcRes;
            this.bcFileSrcData = this.bcFileRes;
          }
        }
        if (sessionStorage.getItem('isSelect') === 'selectLast') {
            this.isSelectAll = true;
        } else {
            this.isSelectAll = false;
        }
        this.columns[0].title = this.i18n.common_term_download_html_filename;
        this.columns[1].title = this.i18n.common_term_log_down;
        this.handleResultListBak();
        this.stopConfirmList = [];
        this.stopConfirmList = this.resultList.filter((item: any) => item.type === 'stopConfirm');
    }

    ngOnChanges(changes: SimpleChanges): void {
        const keys = Object.keys(changes);
        if (keys.length === 1 && keys[0] === 'bottom') { return; }
        this.handleResultListBak();
        this.stopConfirmList = [];
        this.stopConfirmList = this.resultList.filter((item: any) => item.type === 'stopConfirm');
    }

    public deleteMsg(idx: any, msg?: any, type?: any) {
        if (sessionStorage.getItem('isSelect') === 'notSelectLast') {
            this.resultListBak.forEach((el: any) => {
                if (el.type === 'SoftwarePorting') {
                    el.subType = 'SoftwarePorting';
                    this.stopConfirmOpt(el, true);
                    this.msgService.sendMessage({ type: 'SoftwarePortingProgress', data: false });
                }
            });
            return;
        }

        if (!msg) {
            this.resultList.splice(idx, 1);
            this.handleResultListBak();
            if (type === 'SourceCode') {
                this.msgService.sendMessage({ type: 'creatingSourceCodeProgress', data: false }); }
            if (type === 'PackagePorting') {
                this.msgService.sendMessage({ type: 'creatingPackPortingProgress', data: false }); }
            if (type === 'weakCheck') {
                this.msgService.sendMessage({ type: 'creatingWeakCheckProgress', data: false }); }
            if (type === 'bcCheck') {
                this.msgService.sendMessage({ type: 'creatingbcCheckProgress', data: false }); }
            if (type === 'LogManage') {
                this.msgService.sendMessage({ type: 'creatingLogManageProgress', data: false }); }
            if (type === 'weakCompiler') {
                this.msgService.sendMessage({ type: 'creatingWeakCompilerProgress', data: false });
            }
            return;
        }
        if (msg.state.indexOf('stop') >= 0) {
            this.resultList.splice(idx, 1);
            this.handleResultListBak();
            this.stopProgress(msg.type);
            return;
        }
        switch (msg.type) {
            case 'PackagePorting':
                this.stopProgress(msg.type);
                break;
            case 'SourceCode':
                this.stopProgress(msg.type);
                break;
            case 'weakCheck':
                this.stopProgress(msg.type);
                break;
            case 'weakCompiler':
                this.stopProgress(msg.type);
                break;
            case 'bcCheck':
                this.stopProgress(msg.type);
                break;
            case 'LogManage':
                this.stopProgress(msg.type);
                break;
            case 'PortingPreCheck':
                // 6: 预检失败；  8: 路径输入有误
                if (msg.situation === 6 || msg.situation === 8 || (msg.state === 'success' && !msg.data)) {
                    this.delCurrentMsg(msg);
                    this.stopProgress(msg.type);
                    return;
                }
                // 预检报告分析成功
                if (msg.state === 'success' && msg.data) {
                    const info = {
                        id: msg.id,
                        type: 'confirmInfo',
                        pType: 'PortingPreCheck',
                        state: 'prompt',
                        msg: this.i18n.common_term_pre_check_clost_tip
                    };
                    this.resultListBak.splice(idx, 1, { ...info });
                }
                break;
            case 'ByteAlignment':
                // 6: 对齐检查失败；  8: 路径输入有误
                if (msg.situation === 6 || msg.situation === 8 || (msg.state === 'success' && !msg.data)) {
                    this.delCurrentMsg(msg);
                    this.stopProgress(msg.type);
                    return;
                }
                // 对齐检查报告分析成功
                if (msg.state === 'success' && msg.data) {
                    const info = {
                        id: msg.id,
                        type: 'confirmInfo',
                        pType: 'ByteAlignment',
                        state: 'prompt',
                        msg: this.i18n.common_term_byte_alignment_clost_tip
                    };
                    this.resultListBak.splice(idx, 1, { ...info });
                }
                break;
            case 'CachelineAlignment':
              // 6: 预检失败；  8: 路径输入有误
              if (msg.situation === 6 || msg.situation === 8 || (msg.state === 'success' && !msg.data)) {
                this.delCurrentMsg(msg);
                this.stopProgress(msg.type);
                return;
              }
              // 预检报告分析成功
              if (msg.state === 'success' && msg.data) {
                const info = {
                  id: msg.id,
                  type: 'confirmInfo',
                  pType: 'CachelineAlignment',
                  state: 'prompt',
                  msg: this.i18n.common_cacheline_check.close_tip
                };
                this.resultListBak.splice(idx, 1, { ...info });
              }
              break;
            case 'SoftwarePackage':
                this.stopProgress(msg.type);
                this.delCurrentMsg(msg);
                break;
            case 'SoftwarePorting':
                // 3迁移失败；2迁移成功；1迁移中
                if (!msg.data || (msg.data && !msg.data.file)) {
                    this.delCurrentMsg(msg);
                    this.stopProgress(msg.type);
                    return;
                }
                if (this.isFileDownload) {
                    this.stopProgress(msg.type);
                    this.delCurrentMsg(msg);
                    return;
                }
                if (msg.data.file) {
                    const info = {
                        id: msg.id,
                        type: 'confirmInfo',
                        pType: 'SoftwarePorting',
                        state: 'prompt',
                        msg: this.i18n.common_term_migration_success_file_tips
                    };
                    this.resultListBak.splice(idx, 1, { ...info });
                }
                break;

            default:
                break;
        }
    }

  // 行合并处理
  linePortingLevel(list: Array<any>): Array<any> {
    let rowSpan = 1;
    list[0] = Object.assign(list[0], { rowSpan, showTd: true });
    list.reduce((pre, cur) => {
      if (pre.chinese_check_result === cur.chinese_check_result
         && pre.chinese_check_result === '检查成功' && cur.chinese_check_result === '检查成功')
      {
        rowSpan++;
        pre = Object.assign(pre, { rowSpan, showTd: true });
        cur = Object.assign(cur, { rowSpan: 1, showTd: false });
        return pre;
      } else {
        rowSpan = 1;
        cur = Object.assign(cur, { rowSpan, showTd: true });
        return cur;
      }
    });
    return list;
  }

    /**
     * 跳转 对应的联机帮助
     * @param type 类型
     */
     public help(type: string) {
        this.commonService.goHelp(type);
    }

    private stopProgress(type: any) {
        switch (type) {
            case 'PackagePorting':
                this.msgService.sendMessage({ type: 'creatingPackPortingProgress', data: false });
                break;
            case 'SourceCode':
                this.msgService.sendMessage({ type: 'creatingSourceCodeProgress', data: false });
                break;
            case 'SoftwarePackage':
                this.msgService.sendMessage({ type: 'creatingPackageProgress', data: false });
                break;
            case 'SoftwarePorting':
                this.msgService.sendMessage({ type: 'SoftwarePortingProgress', data: false });
                break;
            case 'PortingPreCheck':
                this.msgService.sendMessage({ type: 'CreatingPreCheckProgress', data: false });
                break;
            case 'CachelineAlignment':
                this.msgService.sendMessage({ type: 'CreatingCachelineProgress', data: false });
                break;
            case 'ByteAlignment':
                this.msgService.sendMessage({ type: 'CreatingByteAlignmentProgress', data: false });
                break;
            case 'weakCheck':
                this.msgService.sendMessage({ type: 'creatingWeakCheckProgress', data: false });
                break;
            case 'weakCompiler':
                this.msgService.sendMessage({ type: 'creatingWeakCompilerProgress', data: false });
                break;
            case 'bcCheck':
                this.msgService.sendMessage({ type: 'creatingbcCheckProgress', data: false });
                break;
            case 'LogManage':
                this.msgService.sendMessage({ type: 'creatingLogManageProgress', data: false });
                break;
            default:
                break;
        }
    }

    /**
     * 处理进度条接口传过来得信息
     */
    private handleResultListBak() {
        this.srcData.data = [];
        this.resultListBak = this.resultListBak.filter((bak: any) => {
            return bak.type === 'confirmInfo';
        });
        this.resultList.forEach((res: any) => {
            if (!this.resultListBak.length) {
                if (!this.hasSameData(res)) { this.resultListBak.push({ ...res }); }
            } else {
                this.resultListBak.forEach((item: any) => {
                    if (item.pType !== res.type || item.id !== res.id) {
                        if (!this.hasSameData(res)) { this.resultListBak.push({ ...res }); }
                    }
                });
            }
            if (res.type === 'SoftwarePackage'
                && res.situation === 3
                && res.data
                && res.data.packResult
            ) {
                const packResult = res.data.packResult;
                const list = packResult.split(',');
                list.forEach((file: any) => {
                    if (file !== '') {
                        this.srcData.data.push({
                            file,
                            showTip: false
                        });
                    }
                });
            }
        });
        sessionStorage.setItem('resultMsgList', JSON.stringify(this.resultList));
    }

    private hasSameData(res: any) {
        const len = this.resultListBak.filter((item: any) => {
            return res.id === item.id && (item.type === res.type || item.pType === res.type);
        });
        return len.length > 0;
    }

    public conform(res: any) {
        const residx = this.resultList.findIndex((item: any) => {
            return res.id === item.id && res.pType === item.type;
        });
        const bakidx = this.resultListBak.findIndex((item: any) => {
            return res.id === item.id && res.pType === item.pType && res.type === item.type;
        });
        if (residx >= 0 || bakidx >= 0) {
            this.resultList.splice(residx, 1);
            this.resultListBak.splice(bakidx, 1);
            sessionStorage.setItem('resultMsgList', JSON.stringify(this.resultList));
            this.recordState(res.pType);
        }
        if (res.pType === 'PortingPreCheck') {
            this.msgService.sendMessage({ type: 'CreatingPreCheckProgress', data: false }); }
        if (res.pType === 'CachelineAlignment') {
          this.msgService.sendMessage({ type: 'CreatingCachelineProgress', data: false }); }
        if (res.pType === 'ByteAlignment') {
            this.msgService.sendMessage({ type: 'CreatingByteAlignmentProgress', data: false }); }
        if (res.pType === 'SoftwarePorting') {
            this.msgService.sendMessage({ type: 'SoftwarePortingProgress', data: false }); }
        if (res.pType === 'SoftwarePackage') {
            this.msgService.sendMessage({ type: 'creatingPackageProgress', data: false }); }

    }

    public cancel(res: any) {
        const info = this.resultList.find((item: any) => {
            return res.id === item.id && res.pType === item.type;
        });
        const idx = this.resultListBak.findIndex((item: any) => {
            return res.id === item.id && res.pType === item.pType && res.type === 'confirmInfo';
        });
        this.resultListBak.splice(idx, 1, info);
    }

    public stopMsgTip(type: any) {
        switch (type) {
            case 'PackagePorting':
                return this.i18nService.I18nReplace(
                    this.i18n.common_term_close_task_confirm_tip,
                    { 0: this.i18n.common_term_headerTab1_labe_0 }
                );
            case 'SourceCode':
                return this.i18nService.I18nReplace(
                    this.i18n.common_term_close_task_confirm_tip,
                    { 0: this.i18n.common_term_headerTab1_label }
                );
            case 'SoftwarePackage':
                return this.i18nService.I18nReplace(
                    this.i18n.common_term_close_task_confirm_tip,
                    { 0: this.i18n.common_term_headerTab3_label }
                );
            case 'SoftwarePorting':
                return this.i18nService.I18nReplace(
                    this.i18n.common_term_close_task_confirm_tip,
                    { 0: this.i18n.common_term_headerTab2_label }
                );
            case 'PortingPreCheck':
                return this.i18nService.I18nReplace(
                    this.i18n.common_term_close_task_confirm_tip,
                    { 0: this.i18n.common_term_headerTab3_label2 }
                );
            case 'ByteAlignment':
                return this.i18nService.I18nReplace(
                    this.i18n.common_term_close_task_confirm_tip,
                    { 0: this.i18n.common_alignment_check.operation }
                );
            case 'CachelineAlignment':
              return this.i18nService.I18nReplace(
                this.i18n.common_term_close_task_confirm_tip,
                { 0: this.i18n.common_cacheline_check.title }
              );
            case 'weakCheck':
                return this.i18nService.I18nReplace(
                    this.i18n.common_term_close_task_confirm_tip,
                    { 0: this.i18n.enhanced_functions_label.weak }
                );
            case 'weakCompiler':
                return this.i18nService.I18nReplace(
                    this.i18n.common_term_close_task_confirm_tip,
                    { 0: this.i18n.check_weak.step[1].title_1 }
                );
            case 'bcCheck':
                return this.i18nService.I18nReplace(
                    this.i18n.common_term_close_task_confirm_tip,
                    { 0: this.i18n.check_weak.bc_giveup });
            case 'LogManage':
                return this.i18nService.I18nReplace(
                    this.i18n.common_term_close_task_confirm_tip,
                    { 0: this.i18n.common_term_log_manage_1_tip }
                );
        }
    }

    public stopConfirmOpt(result: any, flag: any) {
        if (!flag) {
            this.deleteStopMsg(result);
            return;
        }
        switch (result.subType) {
            case 'SoftwarePackage':
                const url = '/task/progress/?task_type=1';
                this.Axios.axios.get(url).then((resp: any) => {
                    if (resp.data.task_name) {
                        this.msgService.sendMessage({
                            type: 'closeTaskMsg',
                            data: { isConfirm: flag, result }
                        });
                        this.deleteStopMsg(result);
                        return;
                    }
                });
                break;
            case 'SourceCode':
                this.Axios.axios.get('/portadv/tasks/taskundone/').then((resp: any) => {
                    if (this.commonService.handleStatus(resp) === 0 && resp.data.id) {
                        this.msgService.sendMessage({
                            type: 'closeTaskMsg',
                            data: { isConfirm: flag, result }
                        });
                    }
                    this.deleteStopMsg(result);
                });
                break;
            case 'weakCheck':
                this.Axios.axios.get('/portadv/weakconsistency/tasks/taskundone/').then((resp: any) => {
                    if (this.commonService.handleStatus(resp) === 0 && resp.data.length) {
                        this.msgService.sendMessage({
                            type: 'closeTaskMsg',
                            data: { isConfirm: flag, result }
                        });
                    }
                    this.deleteStopMsg(result);
                    return;
                });
                break;
            case 'weakCompiler':
                this.Axios.axios.get('/portadv/weakconsistency/tasks/taskundone/').then((resp: any) => {
                    if (this.commonService.handleStatus(resp) === 0) {
                        if (Array.isArray(resp.data) && resp.data.length || !Array.isArray(resp.data)) {
                            this.msgService.sendMessage({
                                type: 'closeTaskMsg',
                                data: { isConfirm: flag, result }
                            });
                        }
                    }
                    this.deleteStopMsg(result);
                    return;
                });
                break;
            case 'bcCheck':
                this.Axios.axios.get('/portadv/weakconsistency/tasks/taskundone/').then((resp: any) => {
                    if (this.commonService.handleStatus(resp) === 0 && resp.data.length) {
                        this.msgService.sendMessage({
                            type: 'closeTaskMsg',
                            data: { isConfirm: flag, result }
                        });
                    }
                    this.deleteStopMsg(result);
                    return;
                });
                break;
            case 'LogManage':
                this.Axios.axios.get(
                    `/portadv/runlog/zip_log/?task_id=${encodeURIComponent(result.id)}`
                    ).then((resp: any) => {
                    if (this.commonService.handleStatus(resp) === 0) {
                        this.msgService.sendMessage({
                            type: 'closeTaskMsg',
                            data: { isConfirm: flag, result }
                        });
                    }
                    this.deleteStopMsg(result);
                    return;
                });
                break;
            case 'PackagePorting':
                this.Axios.axios.get('/task/progress/?task_type=7').then((resp: any) => {
                    if (this.commonService.handleStatus(resp) === 0 && resp.data.task_name) {
                        this.msgService.sendMessage({
                            type: 'closeTaskMsg',
                            data: { isConfirm: flag, result }
                        });
                    }
                    this.deleteStopMsg(result);
                });
                break;
            case 'SoftwarePorting':
                this.Axios.axios.get(
                    '/task/progress/?task_type=3'
                    ).then((data: any) => {
                    if (this.commonService.handleStatus(data) === 0) {
                        if (data.data.runningstatus === 1) {
                            this.msgService.sendMessage({
                                type: 'closeTaskMsg',
                                data: { isConfirm: flag, result }
                            });
                        }
                        this.deleteStopMsg(result);
                    }
                });
                break;
            case 'PortingPreCheck':
                this.Axios.axios.get('/portadv/tasks/migrationrunning/').then((data: any) => {
                    if (this.commonService.handleStatus(data) === 0) {
                        if (data.data.id) {
                            this.msgService.sendMessage({
                                type: 'closeTaskMsg',
                                data: { isConfirm: flag, result }
                            });
                        }
                        this.deleteStopMsg(result);
                    }
                });
                break;
            case 'ByteAlignment':
                this.Axios.axios.get('/portadv/tasks/migration/bytealignment/taskinfo/').then((data: any) => {
                    if (this.commonService.handleStatus(data) === 0) {
                        if (data.data.task_id) {
                            this.msgService.sendMessage({
                                type: 'closeTaskMsg',
                                data: { isConfirm: flag, result }
                            });
                        }
                        this.deleteStopMsg(result);
                    }
                });
                break;
            case 'CachelineAlignment':
              this.Axios.axios.get('/portadv/tasks/migration/cachelinealignment/task/').then((data: any) => {
                if (this.commonService.handleStatus(data) === 0) {
                  if (data.data.task_id) {
                    this.msgService.sendMessage({
                      type: 'closeTaskMsg',
                      data: { isConfirm: flag, result }
                    });
                  }
                  this.deleteStopMsg(result);
                }
              });
              break;
            default:
                break;
        }
    }

    private deleteStopMsg(result: any) {
        const idx1 = this.stopConfirmList.findIndex(
            (item: any) => item.id === result.id && item.subType === result.subType
            );
        this.stopConfirmList.splice(idx1, 1);
        const residx = this.resultList.findIndex((item: any) => {
            return result.id === item.id && result.subType === result.subType;
        });
        this.resultList.splice(residx, 1);
        const bakidx = this.resultListBak.findIndex((item: any) => {
            return result.id === item.id && result.subType === result.subType;
        });
        this.resultListBak.splice(bakidx, 1);
        sessionStorage.setItem('resultMsgList', JSON.stringify(this.resultList));
    }

    public delCurrentMsg(res: any) {
        const idx = this.resultList.findIndex((item: any) => {
            return res.id === item.id && item.type === res.type;
        });
        if (idx >= 0) {
            this.resultList.splice(idx, 1);
            this.handleResultListBak();
            this.recordState(res.type);
        }
    }

    public recordState(type: any) {
        if (type === 'SoftwarePackage') { sessionStorage.setItem('anyCtaskId', ''); }
        sessionStorage.setItem('situation', '0');
        sessionStorage.setItem('info', '');
    }

    // 成功时的信息传输
    public createResultOpt(result: any, flag?: any) {
        if (sessionStorage.getItem('KunpengAffinity') === 'true' && flag !== undefined) {
          this.sourceCodeReport = true;
          this.tempResult = result;
        } else {
          sessionStorage.setItem('KunpengAffinity', 'false');
          this.resultOptions.emit(result);
          sessionStorage.setItem('resultMsgList', JSON.stringify(this.resultList));
        }
    }

    public closeGotoReport() {
      this.sourceCodeReport = false;
    }

    public softwareTypeFormat(software: any) {
        const strArr = software.split('_');
        const category = strArr[0];
        const name = strArr[1];
        const version = strArr[2];
        const type = strArr[3];
        const typeLabels: any = {
            BD: this.i18n.common_term_migration_sort_BD,
            MS: this.i18n.common_term_migration_sort_MS,
            DS: this.i18n.common_term_migration_sort_DS,
            DB: this.i18n.common_term_migration_sort_DB,
            NW: this.i18n.common_term_migration_sort_NW,
            RTL: this.i18n.common_term_migration_sort_RTL,
            HPC: this.i18n.common_term_migration_sort_HPC,
            SDS: this.i18n.common_term_migration_sort_SDS,
            CLOUD: this.i18n.common_term_migration_sort_CLOUD,
            NATIVE: this.i18n.common_term_migration_sort_NATIVE,
            WEB: this.i18n.common_term_migration_sort_WEB
        };
        return `(${typeLabels[category]}-${name}-${version}-${type})`;
    }

    // 下载迁移文件
    public downloadFile(result: any) {
        const fileName = result.data.outName;
        const form = document.createElement('form');
        form.action = `${location.origin}/porting/api/portadv/download/`;
        form.method = 'post';
        const input0 = document.createElement('input');
        input0.type = 'hidden';
        input0.name = 'sub_path';
        input0.value = 'migration';
        form.appendChild(input0);
        const input1 = document.createElement('input');
        input1.type = 'hidden';
        input1.name = 'jwt';
        input1.value = sessionStorage.getItem('token').slice(3).trim();
        form.appendChild(input1);
        const input2 = document.createElement('input');
        input2.type = 'hidden';
        input2.name = 'file_path';
        input2.value = fileName;
        form.appendChild(input2);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        this.isFileDownload = true;
        this.recordState(result.type);
    }

    /**
     * 下载构建包
     * @param file 软件包名
     * @param path 软件包 id
     * @param row 每行详情
     */
    public downloadPackage(file: string, path: string, tag?: any, row?: any) {
        if (row) {
            this.showTipInstruct(row);
        }
        this.reportService.downloadPackage(file, path);
        if (tag) { this.downloadCount++; }
        if (!tag || this.downloadCount === this.srcData.data.length) { this.recordState('SoftwarePackage'); }
    }

    // 控制 下发指令 tip显示或隐藏
    showTipInstruct(item: any): void {
        if (!item.showTip) {
            item.showTip = true;
            window.setTimeout(() => {
                item.showTip = false;
            }, 3000);
        }
    }


    public imgUrlFormat(state: any) {
        const urlObj: any = {
            failed: './assets/img/home/icon_error.png',
            success: './assets/img/home/icon_success.png',
            stop_success: './assets/img/home/icon_success.png',
            stop_failed: './assets/img/home/icon_error.png',
            prompt: './assets/img/home/icon_tip.png',
            warn : './assets/img/tip/warn.svg'
        };
        return urlObj[state];
    }

    public formatCreatedId(data: any) {
        const years = data.slice(0, 4);
        const months = data.slice(4, 6);
        const days = data.slice(6, 8);
        const hours = data.slice(8, 10);
        const minutes = data.slice(10, 12);
        const seconds = data.slice(12, 14);
        return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
    }

    private deepClone(obj: any): any {
        if (typeof (obj) !== 'object' || obj === null) {
            return obj;
        }
        let clone: any;
        clone = Array.isArray(obj) ? obj.slice() : { ...obj };
        const keys: Array<string> = Object.keys(clone);

        for (const key of keys) {
            clone[key] = this.deepClone(clone[key]);
        }
        return clone;
    }
}
