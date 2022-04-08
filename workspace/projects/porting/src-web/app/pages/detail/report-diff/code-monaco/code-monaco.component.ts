import { Component, OnInit, ViewChild, Input, OnDestroy, TemplateRef, ViewEncapsulation } from '@angular/core';
import { AxiosService } from '../../../../service/axios.service';
import { I18nService } from '../../../../service/i18n.service';
import { MytipService } from '../../../../service/mytip.service';
import { MessageService } from '../../../../service/message.service';
import { CommonService } from '../../../../service/common/common.service';
import { ActivatedRoute } from '@angular/router';
import * as monaco from 'monaco-editor';
import { TiModalService } from '@cloud/tiny3';
import { HyMiniModalService } from 'hyper';

const enum suggestionTypeEnum {
  NEED_ADD_AVX2NEON = 100, // avx2neon.h的quickfix类型
  NEED_ADD_SSE2NEON = 200, // sse2neon.h的quickfix类型
  PURE_ASSEMBLE_CLEAR_SUGGESTION = 300, // .S的纯汇编的quickfix类型
  PURE_ASSEMBLE_BLURRY_SUGGESTION = 400, // .S纯汇编文件，只有模糊建议的quickfix类型
  C_SOURCEFILE_CLEAR_SUGGESTION = 500, // .c.h文件，可以给出替换代码的quickfix类型
  C_SOURCEFILE_BLURRY_SUGGESTION = 600, // .c.h文件，只有模糊建议的quickfix类型
  MAKE_CLEAR_SUGGESTION = 700, // CMakeList、Makefile文件，可以给出替换代码的quickfix类型
  MAKE_BLURRY_SUGGESTION = 800, //  CMakeList 、Makefile文件，只有模糊建议的quickfix类型
  FORTRAN_BLURRY_SUGGESTION = 900, // fortran文件，只有模糊建议的quickfix类型
  PREPROCESS_BLURRY_SUGGESTION = 1000, // 针对包含预处理的文件的quickfix类型
  PREPROCESS_ARM_SUGGESTION = 1010, // 预编译、win宏的quickfix类型
  ASSEMBLE_SOURCEFILE_SUGGESTION = 1100, // 全汇编翻译的quickfix类型
  ASSEMBLE_SOURCEFILE_NO_SUGGESTION = 1200, // 全汇编翻译的quickfix类型
  ASSEMBLE_ADD_KUNPENGTRANS = 1300, // 需要添加KunpengTrans.h头文件的quickfix类型
  FORTRAN_CLEAR_SUGGESTION = 1400, // fortran相关文件中移植关键字有明确建议
  FORTRAN_BUILTIN_SUGGESTION = 1500, // fortran相关文件中移植的内建函数有明确建议
  C_INTRINSIC_HEADER_SUGGESTION = 1600, //  c/c++源码中使用特殊头文件有提示建议的quickfix类型
  INLINE_ASSEMBLE_BLURRY_SUGGESTION = 2200, // 内嵌汇编等文件中移植关键字有模糊建议的quickfix类型
  C_SPECIFIC_STRUCTURES_BLURRY_SUGGESTION = 2500, // c/c++中特殊结构的模糊建议的quickfix类型
}

@Component({
  selector: 'app-code-monaco',
  templateUrl: './code-monaco.component.html',
  styleUrls: ['./code-monaco.component.scss'],
  encapsulation: ViewEncapsulation.None // 要想设置的样式生效，此处必须配置成 ViewEncapsulation.None
})
export class CodeMonacoComponent implements OnInit, OnDestroy {
  @Input() diffPath: any;
  @Input() reportId: any;
  @Input() isCheck: any;
  @ViewChild('globalReplacementModal', { static: false }) globalReplacementModal: any;
  @ViewChild('ieShowModal', { static: false }) ieShowModal: any;
  public step = -1;
  public preFlag = 1; // 上一个
  public nextFlag = 1; // 下一个
  public diffEditor: any;
  public codeAction: any;
  public newString = '';
  public oldString = '';
  public oldStringFullCom = '';
  public diffList: any = [];
  public codeCompare: any;
  public i18n: any;
  public backStr: string;
  public prevStr: string;
  public allDiff: any = [];
  public focusLine: any = [];
  public nextStr: string;
  public oStr: string;
  public savefilename: any;
  public giveupfilename: any;
  public modifySure: any;
  public pahtMoment: any;
  public iscanBack = false;
  public lineNow = 0;
  public oldMarket: any = [];
  public operationArr: any = [];
  public typeoneFlag = false;
  public typetwoFlag = false;
  public currLang = '';
  public commandId: any;
  public commandId1: any;
  public diffObjList: any = {};
  public decorations: any = [];
  public contentDecorations: any = [];
  public newDecorations: any;
  public lineCount = 0; // 记录当前状态下编辑器代码行数
  public diffNav: any;
  public curFileType = '';
  private backList: any = [];
  public language = 'cpp';
  public replacementNum = 0;
  public lineNum = 0;
  public descriptionlineNum = 0;
  private preChkReportSug = '';
  public diffBackList: Array<any> = [];
  public diffObjCopyList: any = [];
  public modifyContentList: any = [];
  public changeLineArray: any = []; // 变更行的集合
  public heightLightList: any = []; // 高亮行的集合
  public markersCopyList: any = [];
  public isModelBack = false; // true为回退操作，false为修复操作
  public quickfixOneAndAllType: any = [];
  public type = '';
  public sourceCodeFileType = { // 文件类型，用做
    cFile: 'cpp', // C语言相关
    makeFile: 'makefile', // makefile相关
  };
  public checkType = { // 检查类型
    weakCheck: 'weakCheck', // 弱内存序检查
    codeFileCheck: 'codefileinfo', // 源码扫描中有c/c++源码
    makeFileCheck: 'makefileinfo', // 源码扫描中有makefile源码
    asmFileCheck: 'asmfileinfo', // 源码扫描中有汇编源码
    fortranFileCheck: 'fortranfileinfo' // 源码扫描中有fortran源码
  };
  public urlType = {
    portInfo: 'portinginfo', // 获取迁移信息链接
    originInfo: 'originfile' // 获取源文件信息
  };

  constructor(
    private Axios: AxiosService,
    public i18nService: I18nService,
    private route: ActivatedRoute,
    public mytip: MytipService,
    private tiModal: TiModalService,
    private miniModalServe: HyMiniModalService,
    private commonService: CommonService,
    private msgService: MessageService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.isIe();
    this.currLang = sessionStorage.getItem('language');
    sessionStorage.setItem('editFlag', 'false');   // 设置编辑状态为false
    if (this.isCheck) {
      if (sessionStorage.getItem('routerFile') === 'true') {
        this.preChkReportSug = 'This line needs to be adapted for the 64-bit environment. \n';
        this.getCheckFileInfo(this.diffPath, this.checkType.codeFileCheck, []);
      } else {
        this.getCacheLineInfo(this.diffPath, this.checkType.codeFileCheck, []);
      }
    }

    monaco.languages.register({ id: this.sourceCodeFileType.makeFile });
    monaco.languages.setMonarchTokensProvider(this.sourceCodeFileType.makeFile, {
      tokenizer: {
        root: [
          [/^#\s*\w+\s*/, { token: 'keyword' }],
        ],
      }
    });
    this.route.queryParams.subscribe(data => {
      this.type = data.type || '';
    });
    this.quickfixOneAndAllType = [
      suggestionTypeEnum.NEED_ADD_AVX2NEON.toString(),
      suggestionTypeEnum.NEED_ADD_SSE2NEON.toString(),
      suggestionTypeEnum.PURE_ASSEMBLE_CLEAR_SUGGESTION.toString(),
      suggestionTypeEnum.C_SOURCEFILE_CLEAR_SUGGESTION.toString(),
      suggestionTypeEnum.C_SOURCEFILE_BLURRY_SUGGESTION.toString(),
      suggestionTypeEnum.MAKE_CLEAR_SUGGESTION.toString(),
      suggestionTypeEnum.PREPROCESS_BLURRY_SUGGESTION.toString(),
      suggestionTypeEnum.PREPROCESS_ARM_SUGGESTION.toString(),
      suggestionTypeEnum.ASSEMBLE_ADD_KUNPENGTRANS.toString(),
      suggestionTypeEnum.FORTRAN_CLEAR_SUGGESTION.toString(),
      suggestionTypeEnum.FORTRAN_BUILTIN_SUGGESTION.toString(),
      suggestionTypeEnum.INLINE_ASSEMBLE_BLURRY_SUGGESTION.toString()];
  }

  ngOnDestroy(): void {
    this.oldStringFullCom = '';
    if (this.diffEditor) {
      monaco.editor.setModelMarkers(this.diffEditor.getModel(), 'text', []);
    }
    this.clearEditor(); // 清除markers，不然下载从新加载组件时会加载上次的marker
  }

  /**
   * 编辑器容器布局
   */
  public layout() {
    setTimeout(() => {
      this.diffEditor.layout({
        width: document.getElementById('container').offsetWidth - 3,
        height: document.getElementById('container').offsetHeight - 3
      });
    }, 200);
  }

  public getCheckFileInfo(path: any, type: any, notes: any) {
    this.step = -1;
    this.preFlag = 1;
    this.nextFlag = 1;
    sessionStorage.setItem('fileType', type);
    if (notes.length === 0 && path !== 'Notes') {
      const params = {
        file_path: path,
        task_name: this.reportId
      };
      this.Axios.axios.post(`/portadv/tasks/migrationscaninfo/`, params).then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          const arr: any = [];
          resp.data.line.forEach((item: any) => {
            const obj: any = {
              description: '',
              keyword: '',
              locbegin: null,
              locend: null,
              strategy: `//\ ${this.preChkReportSug}\n`,
              type: null
            };
            obj.locbegin = parseInt(item.split(':')[0], 10);
            obj.locend = parseInt(item.split(':')[0], 10);
            arr.push(obj);
          });
          this.oldString = resp.data.content;
          this.diffList = arr;
          this.newString = this.oldString;
          const language =
            type === this.checkType.makeFileCheck
              ? this.sourceCodeFileType.makeFile
              : this.sourceCodeFileType.cFile;
          this.initEditor(type, language);
        }
      });
    } else {
      this.oldString = '';
      this.newString = '';
      notes.forEach((item: any) => {
        this.newString += `${item}\r\n`;
      });
      const language =
        type === this.checkType.makeFileCheck
          ? this.sourceCodeFileType.makeFile
          : this.sourceCodeFileType.cFile;
      this.initEditor(type, language);
    }
    this.pahtMoment = path;
    sessionStorage.setItem('filename', this.pahtMoment);
    this.savefilename = path;
    this.giveupfilename = path;

  }

  public formatNewFile(old: any, str: any) {
    old.replace('\r\n', '\n');
    const oldList = old.split('\n');
    let newString = '';
    if (!this.isCheck) {
      this.diffList.forEach((diff: any, index: any) => {
        let des: any;
        let newDes = '';
        des = diff.description;
        des = des.split('\n');
        des.forEach((item: any, i: any) => {
          if (item !== '') {
            if (i !== 0) {
              des[i] = `${str} ${item}\n`;
              newDes += des[i];
            } else {
              des[i] = `${item}\n`;
              newDes += des[i];
            }
          }
        });

        let dStr: any;
        let newS = '';
        dStr = diff.strategy;
        if (dStr) {
          dStr = dStr.split('\n');
          dStr.forEach((item: any, i: any) => {
            if (i !== 0) {
              dStr[i] = `${str} ${item}\n`;
              newS += dStr[i];
            } else {
              dStr[i] = `${item}\n`;
              newS += dStr[i];
            }
          });
        }
      });
    } else {
      this.diffList.forEach((diff: any) => {
        this.preChkReportSug = 'This line needs to be adapted for the 64-bit environment.';
        oldList[diff.locbegin - 1] = `//\ ${this.preChkReportSug}\n` + oldList[diff.locbegin - 1];
      });
    }

    newString = oldList.join('\n');
    return newString;
  }

  public getCacheLineInfo(path: any, type: any, notes: any) {
    this.step = -1;
    this.preFlag = 1;
    this.nextFlag = 1;
    sessionStorage.setItem('fileType', type);
    if (notes.length === 0 && path !== 'Notes') {
      const params = {
        file_path: path,
        task_name: this.reportId
      };
      this.Axios.axios.post(`/portadv/tasks/migration/cachelinealignment/taskresult/`, params).then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          const arr: any = [];
          resp.data.line.forEach((item: any) => {
            const obj: any = {
              description: 'Description:' + resp.data.description,
              keyword: '',
              locbegin: null,
              locend: null,
              strategy: resp.data.suggestion + ' in line ',
              type: null
            };
            obj.locbegin = item[0];
            obj.locend = item[1];
            obj.strategy = obj.strategy + obj.locend + '.';
            arr.push(obj);
          });
          this.oldString = resp.data.content;
          this.diffList = arr;
          this.newString = this.oldString;
          const language =
            type === this.checkType.makeFileCheck
              ? this.sourceCodeFileType.makeFile
              : this.sourceCodeFileType.cFile;
          this.initEditor(type, language);
        }
      });
    } else {
      this.oldString = '';
      this.newString = '';
      notes.forEach((item: any) => {
        this.newString += `${item}\r\n`;
      });
      const language =
        type === this.checkType.makeFileCheck
          ? this.sourceCodeFileType.makeFile
          : this.sourceCodeFileType.cFile;
      this.initEditor(type, language);
    }
    this.pahtMoment = path;
    sessionStorage.setItem('filename', this.pahtMoment);
    this.savefilename = path;
    this.giveupfilename = path;

  }

  public getFileInfo(path: any, type: any, notes: any) {
    this.step = -1;
    this.preFlag = 1;
    this.nextFlag = 1;
    if (notes.length === 0 && path !== 'Notes') {
      this.curFileType = type;
      const params = {
        filepath: path
      };
      const url = this.getUrl(this.type, this.reportId, this.urlType.portInfo);
      this.Axios.axios.post(url, params).then((resp: any) => {
        // 全汇编翻译：约定portingitems数组只有一组数据；locbegin=1；locend=1；suggestiontype=1100；使用strategy替换newString。
        if (this.commonService.handleStatus(resp) === 0) {
          let language = 'cpp';
          this.oldString = resp.data.content; // 源文件内容
          // 内存一致性
          if (this.type === this.checkType.weakCheck) {
            this.diffList = this.diffListAssignment(resp.data.portingitems); // 待迁移列表
            this.newString = this.oldString;
          } else { // 源码迁移
            this.diffList = resp.data.portingitems; // 待迁移列表
            sessionStorage.setItem('editFlag', 'false');
            this.iscanBack = false;
            if (resp.data.suggestioncontent === '') {
              this.newString = this.formatNewFile(this.oldString, '#');
              if (type === this.checkType.codeFileCheck || type === this.checkType.asmFileCheck) {
                this.newString = this.formatNewFile(this.oldString, '//');
              } else if (type === this.checkType.fortranFileCheck) {
                this.newString = this.formatNewFile(this.oldString, '!');
              }
            } else {
              this.newString = resp.data.content;
            }
          }
          language =
            type === this.checkType.makeFileCheck
              ? this.sourceCodeFileType.makeFile
              : this.sourceCodeFileType.cFile;
          this.initEditor(type, language);
        } else if (resp.status === '0x010611' || this.commonService.handleStatus(resp) === 1) {
          const lang = sessionStorage.getItem('language');
          lang === 'zh-cn'
            ? this.mytip.alertInfo({ type: 'warn', content: resp.infochinese, time: 10000 })
            : this.mytip.alertInfo({ type: 'warn', content: resp.info, time: 10000 });
        }
      });
    } else {
      this.oldString = '';
      this.newString = '';
      notes.forEach((item: any) => {
        this.newString += `${item}\r\n`;
      });
      this.diffList = [];
      const language =
        type === this.checkType.makeFileCheck
          ? this.sourceCodeFileType.makeFile
          : this.sourceCodeFileType.cFile;
      this.initEditor(type, language);
    }
    sessionStorage.setItem('fileType', type);
    this.pahtMoment = path;
    this.savefilename = path;
    this.giveupfilename = path;
    this.modifySure = this.i18n.common_term_sure_save_tip3.toString().replace('${2}', this.replacementNum);
  }

  /**
   * 保存编辑器操作
   * @param modalTemplate 弹窗Dom
   */
  saveEdit(modalTemplate: TemplateRef<any>) {
    const nStr = this.diffEditor.getModel().getValue();
    if (true) {
      this.tiModal.open(modalTemplate, {
        id: 'saveModal',
        modalClass: 'del-report',
        close: (): void => {
          let params: any;
          if (this.type === this.checkType.weakCheck) { // 内存一致性
            params = {
              filepath: this.pahtMoment, // 文件名称
              origincontent: nStr, // 原始源代码文件内容
              locs: [] // 剩余需要替换的行列号
            };
            this.diffList.forEach((item: any) => {
              params.locs.push({
                line: item.locbegin,
                col: item.col
              });
            });
          } else {
            params = {
              filepath: this.pahtMoment, // 文件名称
              origincontent: nStr, // 原始源代码文件内容
              suggestioncontent: '', // 建议源代码文件内容
              portingitems: this.diffList
            };
          }
          this.msgService.sendMessage(params);
          if (this.isCheck) {
            params.migrationitems = [];
            if (sessionStorage.getItem('routerFile') === 'true') { // 64位迁移预检
              this.diffList.forEach((item: any) => {
                params.migrationitems.push(`${item.locbegin}:0`);
              });
              delete params.portingitems;
            } else { // 缓存行对齐检查
              this.diffList.forEach((item: any) => {
                params.migrationitems.push([item.locbegin, item.locend]);
              });
              delete params.portingitems;
            }
          }
          const url = this.getUrl(this.type, this.reportId, this.urlType.originInfo);
          this.Axios.axios.post(url, params).then((res: any) => {
            if (this.commonService.handleStatus(res) === 0) {
              if (this.isCheck) {
                this.getCheckFileInfo(this.pahtMoment, this.checkType.codeFileCheck, []);
                sessionStorage.setItem('editFlag', 'false');
                this.iscanBack = false;
              } else {
                // 根据选取的文件名，获取和该文件相关的待迁移信息
                const portUrl = this.getUrl(this.type, this.reportId, this.urlType.portInfo);
                this.Axios.axios.post(portUrl, { filepath: this.pahtMoment }).then((resp: any) => {
                  if (this.commonService.handleStatus(resp) === 0) {
                    this.oldString = resp.data.content; // 源文件内容
                    if (this.type === this.checkType.weakCheck) { // 内存一致性
                      this.diffList = this.diffListAssignment(resp.data.portingitems); // 源文件列表
                    } else {
                      this.diffList = resp.data.portingitems;
                    }
                    this.newString = resp.data.content;
                    sessionStorage.setItem('editFlag', 'false');
                    this.iscanBack = false;
                    const type = sessionStorage.getItem('fileType');
                    const language =
                      type === this.checkType.makeFileCheck
                        ? this.sourceCodeFileType.makeFile
                        : this.sourceCodeFileType.cFile;
                    this.initEditor(type, language);
                  } else if (resp.status === '0x010611' || this.commonService.handleStatus(resp) === 1) {
                    const lang = sessionStorage.getItem('language');
                    lang === 'zh-cn'
                      ? this.mytip.alertInfo({ type: 'warn', content: resp.infochinese, time: 10000 })
                      : this.mytip.alertInfo({ type: 'warn', content: resp.info, time: 10000 });
                  }
                });
              }
            } else {
              const lang = sessionStorage.getItem('language');
              lang === 'zh-cn'
                ? this.mytip.alertInfo({ type: 'warn', content: res.infochinese, time: 10000 })
                : this.mytip.alertInfo({ type: 'warn', content: res.info, time: 10000 });
            }
          });
        },
        dismiss: (): void => { }
      });
    }
  }

  /**
   * 放弃当前更改操作
   * @param modalTemplate 弹窗Dom
   */
  public giveUp(modalTemplate: TemplateRef<any>) {
    const nStr = this.diffEditor.getModel().getValue();
    // 代码有修改才有放弃操作
    if (this.oStr !== nStr) {
      this.tiModal.open(modalTemplate, {
        id: 'saveModal',
        modalClass: 'del-report',
        close: (): void => {
          sessionStorage.setItem('editFlag', 'false');
          this.iscanBack = false;
          if (this.isCheck) {
            this.getCheckFileInfo(this.pahtMoment, this.checkType.codeFileCheck, []);
            return;
          }
          this.getFileInfo(this.pahtMoment, this.curFileType, []);
        },
        dismiss: (): void => { }
      });
    }
  }

  /**
   * 全局替换建议弹窗打开
   * @param modalTemplate 弹窗Dom
   */
  public globalReplacement(modalTemplate: TemplateRef<any>) {
    this.tiModal.open(modalTemplate, {
      id: 'saveModal',
      modalClass: 'del-report',
      close: (): void => { },
      dismiss: (): void => { }
    });
  }

  /**
   * 初始化编辑器
   * @param type 源码类型
   * @param language 在编辑器中自动创建的模型的初始语言
   */
  initEditor(type: any, language = this.sourceCodeFileType.cFile) {
    this.clearEditor();
    language = language || this.sourceCodeFileType.cFile;
    this.language = language;
    this.diffEditor = monaco.editor.create(document.getElementById('container'), {
      // lightbulb: { enabled: true },
      glyphMargin: true, // 字形边距
      fontSize: 14,
      theme: 'vs', // 主题
      fontFamily: '方正兰亭黑,huaweisans',
      value: this.newString, // 编辑器初始显示文字
      language,
      lineNumbersMinChars: 7, // 行号最大位数
      automaticLayout: true, // 设置宽度自适应

    }
    );
    this.isModelBack = false;
    this.modifyContentList = [];
    this.modifyContentList.push(this.diffEditor.getValue());
    this.diffObjCopyList = [];
    this.diffBackList = [];

    // 编辑器快捷键回退重写
    const that = this;
    this.diffEditor.addCommand(2104, () => {     // 2104 = monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_Z
      // 如果待修改点为设置回退按钮为空
      if (that.modifyContentList.length === 1 && that.diffObjCopyList.length === 1) {
        if (that.iscanBack) {
          that.iscanBack = false;
        }
      } else {
        that.modelBack();
      }
    });
    const originalTxt = this.oldString;
    const modifiedTxt = this.newString;
    this.diffEditor.onDidChangeModelContent((e: any) => {
      this.iscanBack = true;
      if (!this.isModelBack) {
        const len = e.changes[0].text.split('\n').length;
        const changeStart = e.changes[0].range.startLineNumber;
        this.changeLineArray.push({
          startOld: changeStart,
          endOld: e.changes[0].range.endLineNumber,
          start: changeStart,
          end: changeStart + len - 1
        });
        // 每次修改内容记入内存栈
        this.modifyContentList.push(this.diffEditor.getValue());
        this.updateEditor(this.diffEditor, e);
        sessionStorage.setItem('editFlag', 'true');
        const markers = monaco.editor.getModelMarkers({});
        let diffcopyList = [];
        markers.forEach((el, index: number) => {
          if (
            e.changes[0].range.startLineNumber > (el.startLineNumber - 1) &&
            e.changes[0].range.startLineNumber < (el.endLineNumber + 1)
          ) {
            markers.splice(index, 1);
            this.diffList.splice(index, 1);
          }
          if (el.message.indexOf('in line') !== -1) {
              el.message = el.message.substring(0, el.message.indexOf('in line') + 7) + ' ' + el.endLineNumber;
            }
        });
        this.markersCopyList = this.deepCopy(markers);
        this.diffList.forEach((diff: any) => {
          if (diff.suggestiontype === 2500 && (diff.strategy.indexOf('in line') !== -1)) {
            diff.strategy = diff.strategy.substring(0, diff.strategy.indexOf('in line') + 7) + ' ' + diff.locend;
          }
        });
        diffcopyList = this.deepCopy(this.diffList);
        this.setMarker(this.diffEditor.getModel(), markers);
        this.diffObjCopyList.push(JSON.parse(JSON.stringify(markers)));
        this.diffBackList.push(diffcopyList);
      } else {
        this.isModelBack = false;
        this.updateEditor(this.diffEditor, e);
        sessionStorage.setItem('editFlag', 'true');
        this.decorations = this.diffEditor.deltaDecorations([{
          range: new monaco.Range(e.changes[0].range.startLineNumber, 1, e.changes[0].range.endLineNumber, 500),
        }], [], this.language);
        this.setMarker(this.diffEditor.getModel(), this.diffObjCopyList);
        // 改动项清空时，禁止回退
        if (this.modifyContentList.length === 1 && this.diffObjCopyList.length === 1) {
          this.iscanBack = false;
          sessionStorage.setItem('editFlag', 'false');
        }
      }
    });
    this.lineCount = this.diffEditor.getModel().getLineCount();
    this.initRegister(language);
    (window as any).test = this.diffEditor;
    this.diffEditor.layout();
  }
  /**
   * 初始化错误提示
   * @param language 在编辑器中自动创建的模型的初始语言
   */
  initRegister(language: any) {
    // 情况快速修复
    if (this.codeAction) { this.codeAction.dispose(); }
    this.lineCount = this.diffEditor.getModel().getLineCount();
    const self = this;
    this.diffObjList = {
      markerRange: [],
      markers: [],
      fix: []
    };
    this.diffList.forEach((item: any, index: any) => {
      const reg = /#line#/;
      const scanType = sessionStorage.getItem('routerFile');
      item.strategy = item.strategy.replace(reg, item.locend);
      this.diffObjList.markerRange[index] = new monaco.Range(item.locbegin, 0, item.locend, 100);
      this.diffObjList.markers[index] = {
        message: (scanType === 'true' || this.type === 'weakCheck'
          ? ''
          : 'Description: ') + item.description + '\n' + 'Suggestion: ' + item.strategy || ' ',
        strategy: item.strategy || ' ',
        description: item.description || ' ',
        strategyStatic: item.strategy || ' ',
        suggestiontype: item.suggestiontype,
        startLineNumber: item.locbegin,
        startColumn: 0,
        endLineNumber: item.locend,
        endColumn: 500,
        severity: 8,
        code: index,
        inertno: (item.inertno === undefined ? item.insertno : 0),
        replacement: item.replacement,
        quickfix: item.quickfix || '',
      };
    });
    // 添加单个sunggestion修复指令
    this.commandId = this.diffEditor.addCommand('testCmd', (...args: any) => {
      this.doFix(args, 0);
    }, 'testCmd');
    // 添加本文件中修改批量修改指令
    this.commandId1 = this.diffEditor.addCommand('testCmd1', (...args: any) => {
      let suggestionType = ''; // 需要批量修复的类型
      this.diffList.forEach((el: any) => {
        if (el.locbegin === args[1].startLineNumber) {
          suggestionType = el.suggestiontype;
        }
      });
      let sameType: any = [];
      this.diffList.forEach((el: any, index: any) => {
        if (el.suggestiontype === suggestionType) {
          el.code = index;
          sameType.push(el);
        }
      });
      // 内存一致性 当有相同行时 不用quickfix
      if (this.type === 'weakCheck') {
        sameType = sameType.filter((item: any) => item.quickfix);
      }
      this.replacementNum = sameType.length;
      this.modifySure = this.i18n.common_term_sure_save_tip3.toString().replace('${2}', this.replacementNum);
      this.tiModal.open(this.globalReplacementModal, {
        id: 'saveModal',
        modalClass: 'del-report',
        close: (): void => {
          setTimeout(() => {
            this.allFileFix(sameType);
          }, 10);
          this.Axios.showLoding();
        },
        dismiss: (): void => { }
      });
    }, 'testCmd1');
    // 下划线标记位置点
    this.setMarker(this.diffEditor.getModel(), this.diffObjList.markers);
    const markersModal = monaco.editor.getModelMarkers({});
    this.markersCopyList = this.deepCopy(markersModal);
    const diffcopyList = this.deepCopy(this.diffList);
    // 记录默认下划线和difflist数据
    if (this.diffObjCopyList.length === 0) {
    this.diffObjCopyList.push(JSON.parse(JSON.stringify(markersModal)));
    this.diffBackList.push(diffcopyList);
    }
    this.setDecorations(this.diffEditor);
    // 定义quickfix行为
    const that = this;
    this.codeAction = monaco.languages.registerCodeActionProvider(language, {
      provideCodeActions(model, range, context, token) {
        const markers = monaco.editor.getModelMarkers({});
        that.diffList.forEach((el: any) => {
          markers.forEach((element: any) => {
            if (el.locbegin === element.startLineNumber) {
              element.strategy = el.strategy;
            }
          });
        });
        const codeActions = [];
        let preMarker = null;
        for (const marker of context.markers) {
          const fix = self.diffObjList.fix[marker.code];
          let type = '';
          type = that.getSuggestionType(marker);
          if (!preMarker || (preMarker && preMarker.endLineNumber < marker.startLineNumber)){
            if (that.quickfixOneAndAllType.indexOf(String(type)) !== -1 ||
              (that.type === that.checkType.weakCheck && self.diffObjList.markers[marker.code].quickfix)
            ) {
              codeActions.push(
                {
                  title: that.i18n.common_term_quickfix_replacement,
                  diagnostics: [marker],
                  command: {
                    id: self.commandId,
                    title: 'testCmd',
                    tooltip: 'testCmd',
                    arguments: [marker]
                  },
                  kind: 'quickfix' // not sure if necessary / what value should be used
                },
                {
                  title: that.i18n.common_term_quickfix_all_replacement,
                  diagnostics: [marker],
                  command: {
                    id: self.commandId1,
                    title: 'testCmd1',
                    tooltip: 'testCmd1',
                    arguments: [marker]
                  },
                  kind: 'quickfix' // not sure if necessary / what value should be used
                }
              );
            }
            if (String(type) === suggestionTypeEnum.ASSEMBLE_SOURCEFILE_SUGGESTION.toString()) {
              codeActions.push(
                {
                  title: that.i18n.common_term_quickfix_replacement,
                  diagnostics: [marker],
                  command: {
                    id: self.commandId,
                    title: 'testCmd',
                    tooltip: 'testCmd',
                    arguments: [marker]
                  },
                  kind: 'quickfix' // not sure if necessary / what value should be used
                }
              );
            }
            if (String(type) === suggestionTypeEnum.C_INTRINSIC_HEADER_SUGGESTION.toString()) {
              codeActions.push(
                {
                  title: that.i18n.common_term_quickfix_all_replacement,
                  diagnostics: [marker],
                  command: {
                    id: self.commandId1,
                    title: 'testCmd1',
                    tooltip: 'testCmd1',
                    arguments: [marker]
                  },
                  kind: 'quickfix'
                }
              );
            }
          }
          preMarker = marker;
        }
        that.updateSuggestionNum();
        return { actions: codeActions, dispose() { } };
      }
    });
  }

  /**
   * 获取鼠标选中项的建议类型
   * @param marker 选中的marker对象
   */
  public getSuggestionType(marker: any) {
    let type = '';
    this.diffList.forEach((el: any) => {
      if (el.locbegin === marker.startLineNumber) {
        type = el.suggestiontype;
      }
    });
    return type;
  }

  /**
   * 回退
   */
  public modelBack() {
    this.isModelBack = true;
    const nStr = this.diffEditor.getModel().getValue();
    const params = {
      filepath: this.pahtMoment,
      origincontent: nStr,
      suggestioncontent: '',
      portingitems: this.diffList
    };
    this.backList = [];
    const url = this.getUrl(this.type, this.reportId, this.urlType.portInfo);
    if (params.origincontent === params.suggestioncontent && this.oldStringFullCom !== '') {
      sessionStorage.setItem('editFlag', 'false');
      this.iscanBack = false;
      this.Axios.axios
        .post(url, { filepath: this.pahtMoment })
        .then((resp: any) => {
          if (this.commonService.handleStatus(resp) === 0) {
            this.diffList = resp.data.portingitems;
            const type = sessionStorage.getItem('fileType');
            const language =
              type === this.checkType.makeFileCheck
                ? this.sourceCodeFileType.makeFile
                : this.sourceCodeFileType.cFile;
            this.initEditor(type, language);
          } else if (resp.status === '0x010611' || this.commonService.handleStatus(resp) === 1) {
            const lang = sessionStorage.getItem('language');
            lang === 'zh-cn'
              ? this.mytip.alertInfo({ type: 'warn', content: resp.infochinese, time: 10000 })
              : this.mytip.alertInfo({ type: 'warn', content: resp.info, time: 10000 });
          }
        });
    } else {
      this.modifyContentList.pop();
      this.diffObjCopyList.pop();
      this.diffBackList.pop();
      // 获取变更前的内容范围;
      const oldRange = {
        startLineNumber: this.changeLineArray[this.changeLineArray.length - 1].startOld,
        startColumn: 1,
        endLineNumber: this.changeLineArray[this.changeLineArray.length - 1 ].endOld,
        endColumn: 500,
      };
      // 获取修改前的文本
      const oldtxt = monaco.editor.createModel(this.modifyContentList[this.modifyContentList.length - 1])
        .getValueInRange(oldRange);
      // 先获取e.start到e.end的内容，然后吧现在e.statr+len位置的值插入e.start到e.end的内容
      const newrange = new monaco.Range(
        this.changeLineArray[this.changeLineArray.length - 1].start,
        1,
        this.changeLineArray[this.changeLineArray.length - 1].end,
        500
      );
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range: newrange, text: oldtxt, forceMoveMarkers: false };
      this.diffEditor.executeEdits('insert code', [op]);
      this.diffEditor.deltaDecorations(this.contentDecorations, [
        {
          range: new monaco.Range(
            this.changeLineArray[this.changeLineArray.length - 1].startOld,
            1,
            this.changeLineArray[this.changeLineArray.length - 1 ].endOld,
            500),
          options: {
            isWholeLine: true,
            className: 'myContentClass1',
          }
        }
      ]);
      this.changeLineArray.pop();
      this.setMarker(this.diffEditor.getModel(), this.diffObjCopyList[this.diffObjCopyList.length - 1]);
      this.diffList = this.deepCopy(this.diffBackList[this.diffBackList.length - 1]);
    }
    this.setDecorations(this.diffEditor);
  }

  /**
   * 设置问题标记点
   * @param model 文字模型
   * @param markers 标记信息对象
   */
  public setMarker(model: any, markers: any) {
    monaco.editor.setModelMarkers(model, 'text', markers);
  }

  public setDecorations(editor: any) {
    const markers = monaco.editor.getModelMarkers({});
    this.newDecorations = markers.map(e => {
      return {
        range: new monaco.Range(e.startLineNumber, e.startColumn, e.startLineNumber, e.endColumn),
        options: {
          glyphMarginClassName: 'errorIcon',
          isWholeLine: true
        }
      };
    });
    this.decorations = editor.deltaDecorations(this.decorations, this.newDecorations, this.language);
  }
  /**
   * 快速修复指令
   * @param args 参数
   * @param idx 标志位
   */
  public doFix(args: any, idx: number) {
    setTimeout(() => {
      if ((idx + 1) === Number(this.replacementNum)) {
        let successTitle = this.i18n.common_term_success_tip.replace('${1}', this.pahtMoment);
        successTitle = successTitle.toString().replace('${2}', this.replacementNum);
        this.mytip.alertInfo({ type: 'success', content: successTitle, time: 10000 });
        this.Axios.closeLoding();
      }
    }, 1);
    let maker;
    let code;
    const markers = monaco.editor.getModelMarkers({});
    if (
      (args.hasOwnProperty('suggestiontype'))
      || (this.type === this.checkType.weakCheck && Object.prototype.toString.call(args) === '[object Object]')
    ) {
      code = args.code;
      markers.forEach(el => {
        if (el.startLineNumber === args.locbegin) {
          code = el.code;
        }
      });
      maker = Object.keys(args).reduce((newData: any) => {
        const startLineNumber = 'startLineNumber';
        const endLineNumber = 'endLineNumber';
        const strategy = 'strategy';
        const keyword = 'keyword';
        const replacement = 'replacement';
        const description = 'description';
        const insertno = 'insertno';
        newData[startLineNumber] = args.locbegin;
        newData[endLineNumber] = args.locend;
        newData[strategy] = args.strategy;
        newData[keyword] = args.keyword;
        newData[replacement] = args.replacement;
        newData[description] = args.description;
        newData[insertno] = args.insertno;
        return newData;
      }, {});
    } else {
      markers.forEach((ei: any, marker: number) => {
        ei.description = this.diffList[marker].description;
        if (args[1].code === ei.code) {
          args[1].description = ei.description;
          args[1].insertno = this.diffList[marker].insertno;
        }
      });

      code = args[1].code;
      maker = args[1];
    }

    // 通过code找到对应的marker
    // 这里的code其实对应this.diffList的index，因为生成diffList是其中的code的值就是index
    const index = this.binary_search(markers, code, 'code');
    if (!index && index !== 0 && this.diffList[index].suggestiontype !== args.suggestiontype) {
      return;
    }
    if (index !== -1) {    // 如果找到了index，则更新页面marker和decoration
      const suggestiontype = this.diffList[index] && this.diffList[index].suggestiontype;
      if (suggestiontype === suggestionTypeEnum.NEED_ADD_AVX2NEON
        || suggestiontype === suggestionTypeEnum.NEED_ADD_SSE2NEON
        || suggestiontype === suggestionTypeEnum.ASSEMBLE_ADD_KUNPENGTRANS) {
        this.fixSug(index, this.diffEditor, maker);
        return;
      }
      this.fixSug(index, this.diffEditor, maker);
    }
    this.setDecorations(this.diffEditor);
  }

  /**
   * 在文件中修改所有该类型建议
   * @param typelist 修改类型list
   */
  public allFileFix(typelist: any) {
    this.replacementNum = typelist.length;
    this.modifySure = this.i18n.common_term_sure_save_tip3.toString().replace('${2}', this.replacementNum);
    typelist.forEach((el: any, index: any) => {
      this.doFix(el, index);
    });
    let successTitle = this.i18n.common_term_success_tip.replace('${1}', this.pahtMoment);
    successTitle = successTitle.toString().replace('${2}', this.replacementNum);
    this.mytip.alertInfo({ type: 'success', content: successTitle, time: 10000 });
  }

  public fixSug(sugIndex: any, editor: any, marker: any) {
    this.isModelBack = false;
    const sug = this.diffList[sugIndex];
    const suggestiontype = sug.suggestiontype;
    this.newString = this.formatNewFile(this.oldString, '#');
    let fixedStr = '# ';
    if (this.curFileType === this.checkType.codeFileCheck || this.curFileType === this.checkType.asmFileCheck) {
      fixedStr = '// ';
    } else if (this.curFileType === this.checkType.fortranFileCheck) {
      fixedStr = '! ';
    }
    if (suggestiontype === suggestionTypeEnum.NEED_ADD_AVX2NEON) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // 需要增加avx2neon.h的，类型定义：100，需要插入到左侧文件头部（多个相同的建议，只在文件头部增加一个）
      let line = 0;
      let content = '';
      const markers = monaco.editor.getModelMarkers({});
      this.diffList.forEach((el: any) => {
        markers.forEach((element: any) => {
          if (el.locbegin === element.startLineNumber) {
            element.suggestiontype = el.suggestiontype;
          }
        });

      });
      markers.forEach((el: any) => {
        if (el.strategy.indexOf('Visit') === 0 && el.suggestiontype === 100) {
          content = '\r\n\t' + '//Suggestion: ' + el.strategy;
        }
      });
      if (content) {
        line = 1;
      }
      if (editor.getValue().indexOf(`#include "avx2neon.h"`) < 0) {
        const range = new monaco.Range(0, 1, 0, 1);
        const id = { major: 1, minor: 1 };
        const op = { identifier: id, range, text: '#if defined(__aarch64__)' + '\r\n' + `\t#include "avx2neon.h"`
        + content + '\r\n' + '#endif\r\n', forceMoveMarkers: false };
        const insertStatus = editor.executeEdits('insert code', [op]); // 在指定位置插入代码
        if (insertStatus) {
          this.editorHighLight(1, (line + 3));
        }
      }
      this.clearMarker_100_200(suggestionTypeEnum.NEED_ADD_AVX2NEON);
      return;
    }
    if (suggestiontype === suggestionTypeEnum.NEED_ADD_SSE2NEON) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // 需要增加sse2neon.h的，类型定义：200，需要插入到左侧文件头部（多个相同的建议，只在文件头部增加一个）
      if (editor.getValue().indexOf(`#include "sse2neon.h"`) < 0) {
        const range = new monaco.Range(0, 1, 0, 1);
        const id = { major: 1, minor: 1 };
        const op = {
          identifier: id,
          range,
          text: '#if defined(__aarch64__)' + '\r\n' + `\t#include "sse2neon.h"` + '\r\n' + '#endif\r\n',
          forceMoveMarkers: false
        };
        editor.executeEdits('insert code', [op]);
      }
      this.clearMarker_100_200(suggestionTypeEnum.NEED_ADD_SSE2NEON);
      return;
    }
    if (suggestiontype === suggestionTypeEnum.ASSEMBLE_ADD_KUNPENGTRANS) {
      // 为全汇编翻译。
      if (editor.getValue().indexOf(`#include "KunpengTrans.h"`) < 0) {
        const range = new monaco.Range(0, 1, 0, 1);
        const id = { major: 1, minor: 1 };
        const op = {
          identifier: id,
          range,
          text: '#if defined(__aarch64__)' + '\r\n' + `\t#include "KunpengTrans.h"` + '\r\n' + '#endif\r\n',
          forceMoveMarkers: false
        };
        editor.executeEdits('insert code', [op]);
      }
      this.clearMarker_100_200(suggestionTypeEnum.ASSEMBLE_ADD_KUNPENGTRANS);
      return;
    }
    if (suggestiontype === suggestionTypeEnum.PURE_ASSEMBLE_CLEAR_SUGGESTION) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // .S纯汇编文件，可以给出替换代码的，类型定义：300，建议修改代码截取Suggestion：后边的部分
      const start = marker.startLineNumber;
      const end = marker.endLineNumber;
      const count = end - start + 1;
      const getLineAndContent = this.getCode(start, count + start, editor);
      const line = getLineAndContent.line;
      const content = getLineAndContent.content;
      const orignLineText = fixedStr + content + '\r\n' + marker.strategy;
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      const insertStatus = editor.executeEdits('insert code', [op]);
      if (insertStatus) {
        this.editorHighLight(start, (start + line));
      }
    }
    if (suggestiontype === suggestionTypeEnum.PURE_ASSEMBLE_BLURRY_SUGGESTION) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // .S纯汇编文件，只有模糊建议的，类型定义：400，建议修改代码增加注释，注释内容为Suggestion内容。
      // TODO第一行不加换行
      const orignLineText = fixedStr + this.getLinesContent(editor, marker) +
        '\r\n' + fixedStr + 'Suggestion: ' + this.formatNewMessage(marker.strategy, fixedStr, false, false);
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      editor.executeEdits('insert code', [op]);
    }
    if (suggestiontype === suggestionTypeEnum.C_SOURCEFILE_CLEAR_SUGGESTION) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // .c.h文件，可以给出替换代码的，类型定义：500，建议修改代码截取Suggestion：后边的部分
      const start = marker.startLineNumber;
      const end = marker.endLineNumber;
      const count = end - start + 1;
      const getLineAndContent = this.getCode(start, count + start, editor);
      const line = getLineAndContent.line;
      const content = getLineAndContent.content;
      const orignLineText = '#if defined(__x86_64__)\r\n\t' + content + '\r\n#elif defined(__aarch64__)\r\n' +
        this.formatBlackMessage(marker.strategy) + '\r\n#endif';
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      const insertStatus = editor.executeEdits('insert code', [op]);
      if (insertStatus) {
        this.editorHighLight(start, (start + line + this.lineNum + 4));
      }
    }
    if (suggestiontype === suggestionTypeEnum.C_SOURCEFILE_BLURRY_SUGGESTION) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // .c.h文件，只有模糊建议的，类型定义：600，建议修改代码增加注释，注释内容为Suggestion内容
      // TODO第一行不加换行
      const start = marker.startLineNumber;
      const end = marker.endLineNumber;
      const count = end - start + 1;
      const getLineAndContent = this.getCode(start, count + start, editor);
      const line = getLineAndContent.line;
      const content = getLineAndContent.content;
      let orignLineText = '';
      if (editor.getModel().getLineContent(marker.startLineNumber) !== '') {
        const msgArr = marker.strategy.split('\n');
        const preStr = !msgArr[0] || msgArr[0] === ' ' ? '' : fixedStr;
        orignLineText = '#if defined(__x86_64__)\r\n\t' + content +
          '\r\n#elif defined(__aarch64__)\r\n\t' +
          fixedStr + 'Suggestion: \n\t' +
          fixedStr + this.formatNewMessage(marker.strategy, fixedStr, false, true) + '\r\n#endif';
      } else {
        orignLineText = '#if defined(__x86_64__)\r\n\t' + content +
          '\r\n#elif defined(__aarch64__)' + marker.strategy + '\r\n#endif';
      }
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      const insertStatus = editor.executeEdits('insert code', [op]);
      if (insertStatus) {
        this.editorHighLight(start, (start + line + this.lineNum + 4));
      }
    }
    if (suggestiontype === suggestionTypeEnum.MAKE_CLEAR_SUGGESTION) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // CMakeList、Makefile文件，可以给出替换代码的，类型定义：700，建议修改代码为Suggestion：后边的部分
      const start = marker.startLineNumber;
      const end = marker.endLineNumber;
      let line: any[]; // 出现换行符的次数
      let lineNum; // 出现换行符的次数
      const s = /\n/ig;
      this.diffList.forEach((el: any, index: any) => {
        if (el.locbegin === marker.startLineNumber) {
          marker.code = index;
        }
      });
      const keyword = this.diffList[marker.code].keyword;
      const replacement = this.diffList[marker.code].replacement || '\t';
      if (replacement.length !== 0) {
        line = replacement[0].match(s); // 若匹配不到，返回[“”]
      }
      if (line !== ['']) {
        lineNum = 0; // 若匹配不到，次数设置为0
      } else {
        lineNum = line.length;
      }
      let orignLineText = this.getLinesContent(editor, marker);
      orignLineText = orignLineText.replace(keyword.trim(), replacement);
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      const insertStatus = editor.executeEdits('insert code', [op]);
      if (insertStatus) {
        this.editorHighLight(start, (start + lineNum));
      }
    }
    if (suggestiontype === suggestionTypeEnum.MAKE_BLURRY_SUGGESTION) {
      // 根据后端不通的返回 进行不通的操作，具体见需求文档
      // CMakeList 、Makefile文件，只有模糊建议的，类型定义：800，建议修改代码为Suggestion全量字符。
      let orignLineText = '';
      if (editor.getModel().getLineContent(marker.startLineNumber) !== '') {
        orignLineText = fixedStr + this.getLinesContent(editor, marker) + '\r\n' +
          this.formatNewMessage(marker.strategy, fixedStr, true, false);
      } else {
        orignLineText = fixedStr + 'Suggestion: ' + this.getLinesContent(editor, marker) + marker.strategy;
      }
      const range = new monaco.Range(marker.startLineNumber, 1, marker.startLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      editor.executeEdits('insert code', [op]);

    }
    if (suggestiontype === suggestionTypeEnum.FORTRAN_BLURRY_SUGGESTION) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // fortran文件，只有模糊建议的，类型定义：900，建议修改代码为Suggestion全量字符。
      let orignLineText = '';
      if (editor.getModel().getLineContent(marker.startLineNumber) !== '') {
        orignLineText = fixedStr + this.getLinesContent(editor, marker) + '\r\n' +
          this.formatNewMessage(marker.strategy, fixedStr, true, false);
      } else {
        orignLineText = fixedStr + this.getLinesContent(editor, marker) + marker.strategy;
      }
      const range = new monaco.Range(marker.startLineNumber, 1, marker.startLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      editor.executeEdits('insert code', [op]);

    }
    if (suggestiontype === suggestionTypeEnum.PREPROCESS_BLURRY_SUGGESTION) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // 针对包含预处理的文件，需要增加aarch64分支的，类型定义：1000，建议修改代码为增加“#elif defined  __aarch64__”及Suggestion全量字符。
      const start = marker.startLineNumber;
      const end = marker.endLineNumber;
      const orignLineText = '#elif defined(__aarch64__)\r\n' +
        fixedStr + 'Suggestion:' + this.formatNewMessage(marker.strategy, fixedStr, false, true) + '\r\n' +
        editor.getModel().getLineContent(marker.endLineNumber);
      const range = new monaco.Range(marker.endLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      const insertStatus = editor.executeEdits('insert code', [op]);
      if (insertStatus) {
        this.editorHighLight(end, (end + 3));
      }

    }
    if (suggestiontype === suggestionTypeEnum.PREPROCESS_ARM_SUGGESTION) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // 针对包含预处理的文件，需要增加aarch64分支的，类型定义：1010，建议修改代码为增加“#elif defined  __aarch64__”及Suggestion全量字符。
      const start = marker.startLineNumber;
      const end = marker.endLineNumber;
      const insertno = marker.insertno;
      const countFront = insertno - start;
      const getLineAndContentPre = this.getCode(start, countFront + start, editor);
      const lineFront = getLineAndContentPre.line;
      const contentFront = getLineAndContentPre.content;
      const countBack = end - insertno;
      const getLineAndContentBack = this.getCode(insertno, countBack + insertno, editor);
      const lineBack = getLineAndContentBack.line;
      const contentBack = getLineAndContentBack.content;
      const orignLineText = contentFront + '#elif defined(__aarch64__)\r\n' +
        fixedStr + 'Suggestion:' + this.formatNewMessage(marker.strategy, fixedStr, false, true) + '\r\n' +
        contentBack + editor.getModel().getLineContent(end);
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      const insertStatus = editor.executeEdits('insert code', [op]);
      if (insertStatus) {
        this.editorHighLight(insertno, (insertno + 1));
      }

    }
    if (suggestiontype === suggestionTypeEnum.ASSEMBLE_SOURCEFILE_SUGGESTION) {
      // 此时为全汇编翻译，右侧建议代码直接替换左侧代码。
      // this.oldString = this.newString;
      this.newString = marker.strategy;
      this.oldStringFullCom = editor.getModel().getValue();
      editor.getModel().setValue(this.newString);
      marker = [];
      this.diffList = [];
      // this.initEditor('');
    }
    if (suggestiontype === suggestionTypeEnum.ASSEMBLE_SOURCEFILE_NO_SUGGESTION) {
      // 为全汇编翻译。
      const orignLineText = fixedStr + 'Suggestion: ' + marker.strategy + '\r\n' + this.getLinesContent(editor, marker);
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      editor.executeEdits('insert code', [op]);
    }
    if (suggestiontype === suggestionTypeEnum.FORTRAN_CLEAR_SUGGESTION) {
      const start = marker.startLineNumber;
      const end = marker.endLineNumber;
      let line = 0; // 出现换行符的次数
      const s = /\r\n/ig;
      line = marker.strategy.match(s) || 0; // 若匹配不到，次数设置为0
      const orignLineText = marker.strategy;
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      const insertStatus = editor.executeEdits('insert code', [op]);
      if (insertStatus) {
        this.editorHighLight(start, start + line);
      }
    }
    if (suggestiontype === suggestionTypeEnum.FORTRAN_BUILTIN_SUGGESTION) {
      const start = marker.startLineNumber;
      const end = marker.endLineNumber;
      const count = end - start + 1;
      const getLineAndContent = this.getCode(start, count + start, editor);
      const line = getLineAndContent.line;
      const orignLineText = '#ifdef __GFORTRAN__\r\n\t' + marker.strategy + '\r\n#else\r\n\t'
      + this.getLinesContent(editor, marker) + '\r\n#endif';
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      const insertStatus = editor.executeEdits('insert code', [op]);
      if (insertStatus) {
        this.editorHighLight(start, (start + line + 3));
      }
    }
    if (suggestiontype === suggestionTypeEnum.C_INTRINSIC_HEADER_SUGGESTION) {
      // 此时为intrinsic头文件替换类型
      // 扫描的文件中出现intrinsic文件新增x86的宏，#if defined(__x86_64__) #endif避免编译编译过程中出现问题
      const start = marker.startLineNumber;
      const end = marker.endLineNumber;
      const count = end - start + 1;
      let line = 0;
      let content = '';
      for (let index = start; index < count + start; index++) {
        if (index === (count + start - 1)) {
          content += (editor.getModel().getLineContent(index) + '\r\n');
        } else {
          content += (editor.getModel().getLineContent(index) + '\r\n\t');
        }
        line++;
      }
      const orignLineText = '#if defined(__x86_64__)\r\n\t' + content + '#endif';
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      const insertStatus = editor.executeEdits('insert code', [op]);
      if (insertStatus) {
        this.editorHighLight(start, (start + line + 1));
      }
    }
    if (suggestiontype === suggestionTypeEnum.INLINE_ASSEMBLE_BLURRY_SUGGESTION) {
      // 根据后端不同的返回 进行不同的操作，具体见需求文档
      // .c.h文件，只有模糊建议的，类型定义：600，建议修改代码增加注释，注释内容为Suggestion内容
      // TODO第一行不加换行
      let orignLineText = '';
      const start = marker.startLineNumber;
      const end = marker.endLineNumber;
      const count = end - start + 1;
      const getLineAndContent = this.getCode(start, count + start, editor);
      const line = getLineAndContent.line;
      const content = getLineAndContent.content;
      if (editor.getModel().getLineContent(marker.startLineNumber) !== '') {
        const msgArr = marker.strategy.split('\n');
        const preStr = !msgArr[0] || msgArr[0] === ' ' ? '' : fixedStr;
        orignLineText = '#if defined(__x86_64__)\r\n\t' + content
          + '\r\n#elif defined(__aarch64__)\n'
          + this.formatDescription(marker.description, fixedStr, false, true) + '\r\n\t'
          + fixedStr + 'Suggestion: \n\t' + fixedStr
          + this.formatNewMessage(marker.strategy, fixedStr, false, true) + '\r\n#endif';
      } else {
        orignLineText = '#if defined(__x86_64__)\r\n\t' + content +
          '\r\n#elif defined(__aarch64__)' + marker.strategy + '\r\n#endif';
      }
      const range = new monaco.Range(marker.startLineNumber, 1, marker.endLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      const insertStatus = editor.executeEdits('insert code', [op]);
      if (insertStatus) {
        this.editorHighLight(start, (start + line + this.descriptionlineNum + this.lineNum + 5));
      }
    }
    // 内存一致性
    if (this.type === this.checkType.weakCheck) {
      let orignLineText = '';
      if (editor.getModel().getLineContent(marker.startLineNumber) !== '') {
        orignLineText = '\t__asm__ volatile("dmb sy");' + '\r\n' + this.getLinesContent(editor, marker);
      }
      const range = new monaco.Range(marker.startLineNumber, 1, marker.startLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      editor.executeEdits('insert code', [op]);
    }

    if (!suggestiontype && this.isCheck) {
      let orignLineText = '';
      if (editor.getModel().getLineContent(marker.startLineNumber) !== '') {
        orignLineText = `  ${marker.strategy}` + editor.getModel().getLineContent(marker.startLineNumber);
      }
      const range = new monaco.Range(marker.startLineNumber, 1, marker.startLineNumber, 500);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range, text: orignLineText, forceMoveMarkers: false };
      editor.executeEdits('insert code', [op]);
    }
    editor.focus();
    const markerList = monaco.editor.getModelMarkers({});
    markerList.forEach((item: any, index: any) => {
      if (item.locbegin === marker.startLineNumber) {
        markerList.splice(index, 1);
        this.setMarker(this.diffEditor.getModel(), markerList);
      }
    });

  }

  /**
   * 编辑文本高亮
   * @param start 开始行
   * @param end 结束行
   */
  public editorHighLight(start: any, end: any) {
    this.heightLightList.push({start, end});
    this.contentDecorations.push(this.diffEditor.deltaDecorations([], [
      {
        range: new monaco.Range(start, 1, end, 500),
        options: {
          isWholeLine: true,
          className: 'myContentClass',
        }
      }
    ]));
  }
  /**
   * 根据行号取对应字符串
   * @param editor 编辑器对象
   * @param marker 标记对象
   */
  private getLinesContent(editor: any, marker: any) {
    if (marker.endLineNumber - marker.startLineNumber === 0) {
      return editor.getModel().getLineContent(marker.startLineNumber);
    }
    let content = '';
    for (let index = marker.startLineNumber; index <= marker.endLineNumber; index++) {
      content += (editor.getModel().getLineContent(index) + '\n');
    }
    return content;
  }

  /**
   * 清除重复添加头文件的marker
   * @param type suggestionType
   */
  private clearMarker_100_200(type: any) {
    const type200s = this.diffList.filter((item: any) => {
      return item.suggestiontype === type;
    });
    const markers = monaco.editor.getModelMarkers({});
    this.diffList.forEach((el: any) => {
      markers.forEach((element: any) => {
        if (el.locbegin === element.startLineNumber) {
          element.strategy = el.strategy;
        }
      });
    });
    type200s.forEach((item: any) => {
      const mIdx = markers.findIndex((marker: any) => {
        return item.strategy === marker.strategy;
      });
      if (mIdx >= 0) {
        markers.splice(mIdx, 1);
        this.diffList.splice(mIdx, 1);
      }
    });
    this.setMarker(this.diffEditor.getModel(), markers);
    this.setDecorations(this.diffEditor);
  }

  public formatNewMessage(str: any, prefix: any, flag: any, isTab: any) {
    let newString = '';
    let lineNum = 0;
    const tab = isTab ? '\t' : '';
    const oldString = str.split('\n');
    let idx = 0;
    oldString.forEach((item: any, i: any) => {
      if (!item) { idx++; }
      if (item !== '') {
        if (i === oldString.length - 1) {
          oldString[i] = (!flag && i === idx) ? `${tab + item}` : `${tab + prefix}${item}`;
        } else if (i === 0) {
          oldString[i] = (!flag && i === idx) ? `${tab + item}\n` : `${tab + prefix}Suggestion: ${item}\n`;
        } else {
          oldString[i] = (!flag && i === idx) ? `${tab + item}\n` : `${tab + prefix}${item}\n`;
        }
        newString += oldString[i];
      }
      lineNum++;
    });
    this.lineNum = lineNum;
    return newString;
  }

  public formatDescription(str: any, prefix: any, flag: any, isTab: any) {
    let newString = '';
    let lineNum = 0;
    const tab = isTab ? '\t' : '';
    const oldString = str.split('\n');
    let idx = 0;
    oldString.forEach((item: any, i: any) => {
      if (!item) { idx++; }
      if (item !== '') {
        if (i === oldString.length - 1) {
          oldString[i] = (!flag && i === idx) ? `${tab + item}` : `${tab + prefix}${item}`;
        } else if (i === 0) {
          oldString[i] = (!flag && i !== idx) ? `${tab + item}\n` : `${tab + prefix}Description: ${item}\n`;
        } else {
          oldString[i] = (!flag && i === idx) ? `${tab + item}\n` : `${tab + prefix}${item}\n`;
        }
        newString += oldString[i];
      }
      lineNum++;
    });
    this.descriptionlineNum = lineNum;
    return newString;
  }

  public formatBlackMessage(str: any) {
    let newString = '';
    let lineNum = 0;
    const oldString = str.split('\n');
    oldString.forEach((item: any, i: any) => {
      if (item !== '') {
        oldString[i] = `\t${item}\n`;
        newString += oldString[i];
        lineNum++;
      }
    });
    this.lineNum = lineNum;
    return newString;
  }

  /**
   * 当源文件内容发生改变时调用 更新源文件内容
   * @param editor 编辑器
   * @param e 修改内容
   */
  public updateEditor(editor: any, e: any) {
    const currentLineCount = editor.getModel().getLineCount();
    let markers = monaco.editor.getModelMarkers({});
    let diffLineCount = 0;
    let operatLineIndex = 0;

    if (currentLineCount !== this.lineCount) {
      if (currentLineCount > this.lineCount) {
        diffLineCount = currentLineCount - this.lineCount;
        operatLineIndex = e.changes[0].range.startLineNumber;
        this.diffList.forEach((item: any) => {
          if (item.locbegin === e.changes[0].range.startLineNumber
            && item.locend === e.changes[0].range.endLineNumber
            && item.suggestiontype === suggestionTypeEnum.PREPROCESS_ARM_SUGGESTION) {
            operatLineIndex = item.insertno;
          }
        });
        markers.forEach(item => {                       // 如果行号大于操作行号的 则需要更新位置信息
          if (item.startLineNumber > operatLineIndex) {   // 需要将在末尾敲回车的情况排除
            item.startLineNumber += diffLineCount;
            item.endLineNumber += diffLineCount;
          }
          if (
            item.startLineNumber === operatLineIndex &&
            (e.changes[0].range.endColumn === e.changes[0].range.startColumn &&
            e.changes[0].range.endColumn === 1)
          ) {
            item.startLineNumber += diffLineCount;
            item.endLineNumber += diffLineCount;
          }
        });
        this.diffList.forEach((item: any) => {
          if (item.locbegin > operatLineIndex) {
            item.locbegin += diffLineCount;
            item.locend += diffLineCount;
            item.insertno += diffLineCount;
          }
        });

      } else if (currentLineCount < this.lineCount) {  // 减少一行的时候需要判断是否把marker那行删掉
        diffLineCount = this.lineCount - currentLineCount;
        // 先判断删除的行是否包含marker
        for (let i = 1; i <= diffLineCount; i++) {                       // 当删除带有marker行后，删除对应的marker
          operatLineIndex = e.changes[0].range.startLineNumber + i;
          for (let k = 0; k < markers.length; k++) {
            const startLineNumber = markers[k].startLineNumber;
            if ((startLineNumber - diffLineCount) > operatLineIndex) {   // 如果行数比操作行大了，跳出循环优化性能
              break;
            } else if (
              e.isUndoing === false &&
              startLineNumber === operatLineIndex &&
              !(e.changes[0].range.endColumn === e.changes[0].range.startColumn &&
              e.changes[0].range.endColumn === 1)
            ) {
              markers.splice(k, 1);
              this.diffList.splice(k, 1);
            }
            // 删除操作会自动更新，不需要我们手动写代码
          }

        }
        this.diffList.forEach((item: any) => {
          if (item.locbegin >= operatLineIndex) {
            item.locbegin -= diffLineCount;
            item.locend -= diffLineCount;
            item.insertno -= diffLineCount;
          }
        });
        if (this.backList.length) {
          const language =
            sessionStorage.getItem('fileType') === this.checkType.makeFileCheck
              ? this.sourceCodeFileType.makeFile
              : this.sourceCodeFileType.cFile;
          const lineNum = e.changes[0].range.startLineNumber;
          const curMarker = this.backList.filter((bak: any) => bak.locbegin === lineNum || bak.locend === lineNum);
          if (
            curMarker.length &&
            this.diffList &&
            this.diffList.length &&
            curMarker[0].suggestiontype !== suggestionTypeEnum.NEED_ADD_AVX2NEON &&
            curMarker[0].suggestiontype !== suggestionTypeEnum.NEED_ADD_SSE2NEON
          ) {
            const len = this.diffList.length;
            if (this.diffList[0].locbegin > lineNum) {
              this.diffList.unshift(curMarker[0]);
            } else if (this.diffList[len - 1].locbegin < lineNum) {
              this.diffList.push(curMarker[0]);
            } else {
              const list = this.diffList.slice();
              list.forEach((item: any, idx: any) => {
                if (item.locbegin < lineNum && this.diffList[idx + 1].locbegin > lineNum) {
                  this.diffList.splice(idx + 1, 0, curMarker[0]);
                }
              });
            }
            this.initRegister(language);
            markers = monaco.editor.getModelMarkers({});
          } else {
            if (!this.diffList.length || lineNum === 1) {
              this.diffList = JSON.parse(JSON.stringify(this.backList));
              this.initRegister(language);
              markers = monaco.editor.getModelMarkers({});
            } else {
              markers.forEach(item => {                       // 如果行号大于操作行号的 则需要更新位置信息
                if (item.startLineNumber >= operatLineIndex) {
                  item.startLineNumber -= diffLineCount;
                  item.endLineNumber -= diffLineCount;
                }
              });
            }
          }
        } else {
          markers.forEach(item => {                       // 如果行号大于操作行号的 则需要更新位置信息
            if (item.startLineNumber >= operatLineIndex) {
              item.startLineNumber -= diffLineCount;
              item.endLineNumber -= diffLineCount;
            }
          });
        }
      }
      this.setMarker(editor.getModel(), markers);
      this.setDecorations(editor);
    }
    const contents = editor.getModel().getLinesContent();
    contents.forEach((lintContent: any, index: any) => {    // 如果marker对应行数类容为空，则删除marker
      if (lintContent === '') {
        markers.forEach((marker, markerIndex) => {
          if (marker.startLineNumber === index + 1) {
            markers.splice(markerIndex, 1);
            this.diffList.splice(markerIndex, 1);
            this.setMarker(editor.getModel(), markers);
            this.setDecorations(editor);
          }
        });
      }
    });
    this.lineCount = currentLineCount;
  }

  // 修改源代码建议编号第一个没有的情况
  public updateSuggestionNum(): void {
    setTimeout(() => {
      const content = $('.marker.hover-contents');
      // 内存一致性可能出现相同行 但是列不同的情况
      [...content].forEach((item, index) => {
        const aSpan = content.eq(index).find('span');
        const el = aSpan.eq(1);
        if (el) {
          if (el.html() === undefined) {
            if (content[0].innerHTML ===
              '<span style="white-space: pre-wrap;"><br>Suggestion: // This line needs to ' +
              'be adapted for the 64-bit environment. <br><br></span>') {
              content[0].innerHTML = '<span style="white-space: pre-wrap;"><br>Suggestion: // This line ' +
              'needs to be adapted for the 64-bit environment. <br></span>';
            }
            content.eq(index).append(`<span style="opacity: 0.6; padding-left: 6px;">(1)</span>`);
          } else {
            let num = Number(el.html().replace('(', '').replace(')', ''));
            el.html(`(${++num})`);
          }
        }
      });
    }, 100);
  }

  /**
   * 查看上一处修改
   */
  public prev() {
    // 获取鼠标当前点击行号
    const lineNumberNow = this.diffEditor.getPosition().lineNumber;
    const markers = monaco.editor.getModelMarkers({});
    if (this.preFlag === 1 && markers) {
      this.step--;
      // 如果在顶部，上一步回到最后一处提醒修改处
      if (this.step < 0) { this.step = (markers.length - 1); }
    }
    let line = markers[0];
    if (lineNumberNow) {
      markers.forEach((el, index) => {
        if (el.startLineNumber === lineNumberNow
            || (lineNumberNow >= el.startLineNumber && lineNumberNow <= el.endLineNumber)) {
          line = markers[index - 1];
          if (Number(index) === 0) { line = markers[markers.length - 1]; }
          return;
        }
      });
    }
    this.diffEditor.revealPosition({                    // 滚动到指定行号
      lineNumber: line.startLineNumber,
      column: line.startColumn
    });
    this.diffEditor.setPosition({                       // 设置光标位置
      lineNumber: line.startLineNumber,
      column: line.startColumn
    });
    this.diffEditor.focus();

  }

  /**
   * 查看下一处修改
   */
  public next() {
    // 获取鼠标当前点击行号
    const lineNumberNow = this.diffEditor.getPosition().lineNumber;
    const markers = monaco.editor.getModelMarkers({});
    if (this.nextFlag === 1) {
      this.step++;
      // 如果在底部，下一步回到顶部提醒修改处
      if (this.step > markers.length - 1) { this.step = 0; }
    }
    let line = markers[0];
    if (lineNumberNow) {
      markers.forEach((el, index) => {
        if (el.startLineNumber === lineNumberNow
            || (lineNumberNow >= el.startLineNumber && lineNumberNow <= el.endLineNumber)) {
          line = markers[index + 1];
          if (Number(index) === (markers.length - 1)) { line = markers[0]; }
          return;
        }
      });
    }
    this.diffEditor.revealPosition({
      lineNumber: line.startLineNumber,
      column: line.startColumn
    });
    this.diffEditor.setPosition({
      lineNumber: line.startLineNumber,
      column: line.startColumn
    });
    this.diffEditor.focus();

  }

  /**
   * 二分法查询被修复处在markerList中的index
   * @param arr markerList
   * @param key 被修复处的行数
   * @param prop markerList中code对象的标识
   */
  public binary_search(arr: any, key: any, prop: any): any {
    let low = 0;
    let high = arr.length - 1;
    let mid = 0;
    while (low <= high) {
      mid = Math.floor((high + low) / 2);
      if (key === arr[mid][prop]) {
        return mid;
      } else if (key > arr[mid][prop]) {
        low = mid + 1;
      } else if (key < arr[mid][prop]) {
        high = mid - 1;
      } else {
        return -1;
      }
    }
  }

  /**
   * 清除maker
   */
  public clearEditor() {
    if (this.diffEditor) {     // 清空上一次残留数据
      monaco.editor.setModelMarkers(this.diffEditor.getModel(), 'text', []);  // 清楚marker
      this.diffEditor.deltaDecorations(this.decorations, [], 'cpp');
      this.diffEditor.dispose();
      this.diffEditor.dispose();

    }
    if (this.codeAction) { this.codeAction.dispose(); }    // 清空上一次残留数据
  }

  /**
   * 给源文件列表赋值
   * @param data 后端返回值
   */
  public diffListAssignment(data: Array<any>): Array<object> {
    const arr: any = [];
    data.forEach(item => {
      const obj: any = {
        description: '',
        keyword: '',
        col: item.col,
        locbegin: item.line,
        locend: item.line,
        quickfix: item.quick_fix,
        strategy: item.quick_fix
          ? `add "__asm__ volatile("dmb sy")" in the position indicated by the below items`
          : this.i18n.check_weak.quickfix_tip,
        type: null
      };
      arr.push(obj);
    });
    return this.type === this.checkType.weakCheck ? arr : this.unique(arr);
  }

  // 数组对象去重
  public unique(arr: Array<any>): Array<any> {
    const obj: any = {};
    return arr.reduce((pre, cur: any) => {
      obj[cur.locbegin] ? obj[cur.locbegin] = obj[cur.locbegin] : obj[cur.locbegin] = pre.push(cur);
      return pre;
    }, []);
  }

  /**
   * 判断浏览器如果为IE,弹窗建议切换Chrome浏览
   */
  public isIe() {
    const userAgent = navigator.userAgent;
    const isIE = (userAgent.indexOf('Trident') >= 0);
    if (isIE) {
      setTimeout(() => {
        this.tiModal.open(this.ieShowModal, {
          id: 'saveModal',
          modalClass: 'del-report',
          close: (): void => { },
          dismiss: (): void => { }
        });
      }, 500);
    }
  }

  /**
   * 递归实现深拷贝
   * @param copyValue 待拷贝对象
   */
  public deepCopy(copyValue: any) {
    const copyedObjs: Array<any> = []; // 此数组解决了循环引用和相同引用的问题，它存放已经递归到的目标对象
    function _deepCopy(target: any) {
            if ((typeof target !== 'object') || !target) {return target; }
            for (const copy of copyedObjs) {
              if (copy.target === target) {
                return copy.copyTarget;
              }
            }
            let obj: any = {};
            if (Array.isArray(target)) {
                obj = []; // 处理target是数组的情况
            }
            copyedObjs.push({target, copyTarget: obj});
            Object.keys(target).forEach(key => {
                if (obj[key]) { return; }
                obj[key] = _deepCopy(target[key]);
            });
            return obj;
        }
    return _deepCopy(copyValue);
  }

  /**
   * @param start 取数开始
   * @param end 取数结束
   * @param editor 编辑器内容
   */
  private getCode(start: number, end: number, editor: any) {
    let line = 0;
    let content = '';
    const retValue = {
      line: 0,
      content: ''
    };
    for (let index = start; index < end; index++) {
      content += (editor.getModel().getLineContent(index) + '\r\n');
      line++;
    }
    retValue.line = line;
    retValue.content = content;
    return retValue;
  }

  /**
   * @param fileType 检查类型
   * @param reportId 报告ID
   * @param infoType 源文件还是迁移信息
   * @return url 返回路径
   */
  private getUrl(fileType: string, reportId: string, infoType: string) {
    const url = fileType === this.checkType.weakCheck
      ? `/portadv/weakconsistency/tasks/${encodeURIComponent(reportId)}/${infoType}/`
      : `/portadv/tasks/${encodeURIComponent(reportId)}/${infoType}/`;
    return url;
  }

}
