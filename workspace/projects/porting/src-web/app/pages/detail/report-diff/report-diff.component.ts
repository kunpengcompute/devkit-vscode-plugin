import { Component, OnInit, ViewChild, Input, ElementRef, Output,
  EventEmitter } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { AxiosService } from '../../../service/axios.service';
import { I18nService } from '../../../service/i18n.service';
import { MytipService } from '../../../service/mytip.service';
import { MessageService } from '../../../service/message.service';
import { CommonService } from '../../../service/common/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TiModalService, TiTreeNode, TiTreeUtil } from '@cloud/tiny3';
import { HyMiniModalService } from 'hyper';

interface ReportInfo{
  id: string;
  create: string;
}
@Component({
  selector: 'app-report-diff',
  templateUrl: './report-diff.component.html',
  styleUrls: ['./report-diff.component.scss']
})
export class ReportDiffComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private Axios: AxiosService,
    private el: ElementRef,
    public i18nService: I18nService,
    private tiModal: TiModalService,
    private $location: PlatformLocation,
    public mytip: MytipService,
    private miniModalServe: HyMiniModalService,
    public commonService: CommonService,
    private msgService: MessageService
  ) {
    this.i18n = this.i18nService.I18n();
    $location.onPopState(() => {
      sessionStorage.setItem('routerFile', 'false');
      sessionStorage.setItem('KunpengAffinity', 'false');
    });
  }
  @Output() showMain = new EventEmitter();
  @ViewChild('diffIns', { static: false }) diffIns: any;
  @ViewChild('diffInsByte', { static: false }) diffInsByte: any;
  @ViewChild('diffInsfile', { static: false }) diffInsfile: any;
  @ViewChild('diffInsCacheLine', { static: false }) diffInsCacheLine: any;
  @ViewChild('saveEditorModal', { static: false }) saveEditorModal: any;
  @ViewChild('ieShowModal', { static: false }) ieShowModal: any;
  @Input() report: ReportInfo = {
    id: '',
    create: ''
  };
  @Input() selectFileInfo: any;
  @Output() confirmFileList = new EventEmitter();
  public i18n: any;

  public currentFile: string;
  public currentFile1: any = [];

  public showTitle: boolean;
  public closefileName: string; // tip 提示路径
  public filePath: string;
  public sourceDir: string;
  public isOpenTitle = false;
  public routerFile = false; // 64位迁移预检
  public routerFileDQJC = false; // 结构体检查
  public routerFileCacheLine = false; // 缓存行对齐检查
  public originFiles: any = [];
  public giveupfilename: any;
  public workspace = '';
  public goBackTip = '';
  public fileSearch: any = {
    placeholder: '',
    value: ''
  };
  public isFileList = true;
  public Diff2Html = (window as any).Diff2Html;

  public isMultiple = true;
  public type: any; // 进来的模块名
  public showTip = false;
  public fileList: Array<any> = [
    {
      name: 'makefile',
      label: 'makefileinfo', // 后端接口对应的字段
      sourceDir: '',
      files: [],
      notes: [],
      isOpen: false,
      isShow: false,
      isActive: false,
      isOpenTitle: false,
    },
    {
      name: 'C/C++ Source File',
      label: 'codefileinfo',
      sourceDir: '',
      files: [],
      isOpen: false,
      isShow: false,
      isActive: false,
      isOpenTitle: false,
    },
    {
      name: 'ASM File',
      label: 'asmfileinfo',
      sourceDir: '',
      files: [],
      isOpen: false,
      isShow: false,
      isActive: false,
      isOpenTitle: false,
    },
    {
      name: 'Fortran',
      label: 'fortranfileinfo',
      sourceDir: '',
      files: [],
      isOpen: false,
      isShow: false,
      isActive: false,
      isOpenTitle: false,
    },
    {
      name: 'Python',
      label: 'pythonfileinfo',
      sourceDir: '',
      files: [],
      isOpen: false,
      isShow: false,
      isActive: false,
      isOpenTitle: false,
    },
    {
      name: 'Go',
      label: 'golangfileinfo',
      sourceDir: '',
      files: [],
      isOpen: false,
      isShow: false,
      isActive: false,
      isOpenTitle: false,
    },
    {
      name: 'Java',
      label: 'javafileinfo',
      sourceDir: '',
      files: [],
      isOpen: false,
      isShow: false,
      isActive: false,
      isOpenTitle: false,
    },
    {
      name: 'Scala',
      label: 'scalafileinfo',
      sourceDir: '',
      files: [],
      isOpen: false,
      isShow: false,
      isActive: false,
      isOpenTitle: false,
    }
  ];
  public isActiveItem: any = {
    label: 'makefileinfo',
    index: 0
  };
  public data: Array<TiTreeNode> = [];
  public showData: Array<TiTreeNode> = this.data;
  public currLang: string;
  public fileTreeList: Array<TiTreeNode>;
  public downLoadAble = false;

  goHome(modalTemplate: any) {
    this.showMain.emit();
    setTimeout(() => {
      this.giveupfilename = sessionStorage.getItem('currentfilename');
      this.tiModal.open(modalTemplate, {
        id: 'changeWeb',
        modalClass: 'modal400',
        close: (): void => {
          sessionStorage.setItem('KunpengAffinity', 'false');
          const byte = JSON.parse(sessionStorage.getItem('routerFileDQJC'));
          const precheck = JSON.parse(sessionStorage.getItem('routerFile'));
          const cachecheck = JSON.parse(sessionStorage.getItem('routerFileCacheLine'));
          if (byte) {
            sessionStorage.setItem('EnhancedType', 'byte');
          } else if (precheck) {
            sessionStorage.setItem('EnhancedType', 'precheck');
          } else if (cachecheck) {
            sessionStorage.setItem('EnhancedType', 'cache');
          }
          history.back();
        },
        dismiss: (): void => {
        }
      });
    }
    , 0);
  }

  onSearch(data: any, modalTemplate: any) {
    const flag = sessionStorage.getItem('editFlag');
    if (flag === 'true') {
      this.giveupfilename = sessionStorage.getItem('currentfilename');
      this.tiModal.open(modalTemplate, {
        id: 'changeWebfile',
        modalClass: 'del-report',
        close: (): void => {
          sessionStorage.setItem('editFlag', 'false');
          this.findSearchList(data);
        }
      });
      return;
    }
    this.findSearchList(data);
  }

  ngOnInit() {
    this.isIe();
    this.currLang = sessionStorage.getItem('language');
    this.fileSearch.placeholder = this.i18n.common_term_search;
    if (sessionStorage.getItem('situation') === '7') {
      sessionStorage.setItem('situation', '0');
      sessionStorage.setItem('info', '');
    }
    this.goBackTip = this.i18n.common_term_go_back_tab4;
    this.Axios.axios.get(`/customize/`).then((response: any) => {
      if (this.commonService.handleStatus(response) === 0) {
        this.workspace = `${response.data.customize_path}/portadv/${sessionStorage.getItem('username')}/`;
      }
      this.route.queryParams.subscribe(data => {
        this.type = data.type || '';
        if (!this.report.id) {
          if (sessionStorage.getItem('routerFile') === 'true') {
            sessionStorage.setItem('KunpengAffinity', 'true');
            this.routerFile = true;
          } else if (sessionStorage.getItem('routerFileDQJC') === 'true') {
            sessionStorage.setItem('KunpengAffinity', 'true');
            this.routerFileDQJC = true; // 对齐检查代表
          } else {
            sessionStorage.setItem('KunpengAffinity', 'true');
            this.routerFileCacheLine = true;
          }
          if (typeof data.result_path !== 'string') {
            sessionStorage.setItem('filesPath', JSON.stringify(data.result_path));
          }
          this.report.create = data.created;
          this.report.id = data.id;
        }
      });
      if (this.routerFile || this.routerFileDQJC || this.routerFileCacheLine) {
        this.filePath = JSON.parse(sessionStorage.getItem('filesPath'))[0];
        this.currentFile1 = JSON.parse(sessionStorage.getItem('filesPath'));
        this.closefileName = this.filePath;
        let tempSourceDir;
        if (this.routerFileDQJC) {
          this.isMultiple = false;
          tempSourceDir = this.workspace + 'bytecheck/';
        } else if (this.routerFileCacheLine) {
          tempSourceDir = this.workspace + 'cachecheck/';
        } else {
          tempSourceDir = this.workspace + 'precheck/';
        }
        this.sourceDir = tempSourceDir;
        this.fileList[1].isOpen = true;
        this.fileList[1].isOpenTitle = true;
        this.fileList[1].isActive = true;
        this.currentFile1.forEach((port: any, index: any) => {
          this.fileList[1].files.push({
            path: typeof(port) === 'string' ? port : port.filedirectory,
            isActive: index === 0
          });
        });
        this.fileList[1].isShow = this.fileList[1].files.length > 0;
        this.fileList = this.fileList.filter(item => item.isShow);
        this.isActiveItem = {
          label: this.fileList[0].label,
          index: 0
        };
        this.fileList.forEach((files, index) => {
          this.originFiles.push({
            label: files.label,
            files: []
          });
          files.files.forEach((file: any) => {
            this.originFiles[index].files.push(file.path);
          });
        });
        this.showData = this.fileList;
        // 重组列表树需要的数据
        this.showData.forEach((el: any, idx: number) => {
          el.type = el.label;
          el.label = el.name;
          el.expanded = true;
          el.children = [];
          el.children.push({
            label: this.sourceDir,
            expanded: true,
            children: el.files
          });
          el.children[0].children.forEach((eu: any) => {
            eu.label = eu.path.slice(this.sourceDir.length);
          });
        });
      } else {
        const url = this.type === 'weakCheck'
          ? `/task/progress/?task_type=10&task_id=${encodeURIComponent(this.report.id)}`
          : `/task/progress/?task_type=0&task_id=${encodeURIComponent(this.report.id)}`;
        this.Axios.axios.get(url).then((resp: any) => {
          if (this.commonService.handleStatus(resp) === 0) {
            // 内存一致性
            if (this.type === 'weakCheck') {
              const allFiles: any = [];
              resp.data.result.barriers.forEach((file: any) => {
                allFiles.push(file.file);
              });
              this.filePath = allFiles[0];
              this.currentFile1 = allFiles;
              this.closefileName = this.filePath;
              const sourceDir = resp.data.source_dir + '/';
              this.sourceDir = sourceDir;
              this.fileList[1].sourceDir = sourceDir;
              this.currentFile1.forEach((port: any) => {
                this.fileList[1].files.push({
                  path: typeof(port) === 'string' ? port : port.filedirectory,
                  isActive: false
                });
              });
            } else {
              // 源码迁移
              const dirs = resp.data.info.sourcedir.split(',');
              this.fileList.forEach((file, idx) => {
                const files =
                  resp.data.portingresult.hasOwnProperty([file.label])
                    ? resp.data.portingresult[file.label].files
                    : [];
                if (dirs.length === 1 && files.length) {
                  file.sourceDir = this.workspace + 'sourcecode/';
                  this.sourceDir = file.sourceDir;
                }
                if (dirs.length > 1 && files.length) {
                  file.sourceDir = this.workspace + 'sourcecode/';
                  this.sourceDir = file.sourceDir;
                }
                files.forEach((port: any, index: any) => {
                  file.files.push({
                    path: typeof(port) === 'string' ? port : port.filedirectory,
                    isActive: false
                  });
                });
                if (file.label === 'makefileinfo') {
                  const automakeinfo = resp.data.portingresult.automakeinfo;
                  const automakeFiles = automakeinfo ? resp.data.portingresult.automakeinfo.files : [];
                  automakeFiles.forEach((port: any) => {
                    file.files.push({
                      path: typeof(port) === 'string' ? port : port.filedirectory,
                      isActive: false
                    });
                  });
                  const cmakeinfo = resp.data.portingresult.cmakelistsinfo;
                  const cmakeFiles = cmakeinfo ? resp.data.portingresult.cmakelistsinfo.files : [];
                  if (cmakeFiles.length && dirs.length === 1 && !file.sourceDir) {
                    file.sourceDir = this.workspace + 'sourcecode/';
                    this.sourceDir = file.sourceDir;
                  }
                  cmakeFiles.forEach((port: any) => {
                    file.files.push({
                      path: typeof(port) === 'string' ? port : port.filedirectory,
                      isActive: false
                    });
                  });
                  const notes = resp.data.portingresult.makefileinfo.notes;
                  file.notes = notes || [];
                  if (file.notes.length > 0) {
                    file.files.push({
                      path: 'Notes',
                      isActive: false
                    });
                  }
                }
              });
            }
            this.fileList.forEach((item, index) => {
              this.originFiles.push({
                label: item.label,
                files: []
              });
              item.files.forEach((file: any) => {
                this.originFiles[index].files.push(file.path);
              });
              this.fileList[index].isShow = item.files.length > 0 || (item.notes && item.notes.length > 0);
            });
            this.fileList = this.fileList.filter(item => item.isShow );
            this.originFiles = this.originFiles.filter((item: any) => {
              return item.files.length > 0 || (item.notes && item.notes.length > 0);
            });
            let idxDefault = 0;
            let idxFileDefault = 0;
            if (this.selectFileInfo && this.selectFileInfo.path) {
              this.fileList.forEach((item, idx) => {
                const selIdx = item.files.findIndex((file: any) => file.path === this.selectFileInfo.path);
                if (selIdx >= 0) {
                  idxDefault = idx;
                  idxFileDefault = selIdx;
                }
              });
            }
            if (!this.fileList[idxDefault]) {
              const lang = sessionStorage.getItem('language');
              lang === 'zh-cn'
                ? this.mytip.alertInfo({ type: 'warn', content: '没有需要迁移的源文件', time: 10000 })
                : this.mytip.alertInfo({ type: 'warn', content: 'No source file to be ported', time: 10000 });
              return;
            }
            sessionStorage.setItem('currentfilename', this.fileList[idxDefault].files[idxFileDefault].path);
            this.isActiveItem = {
              label: this.fileList[idxDefault].label,
              index: idxDefault
            };
            this.currentFile = this.fileList[idxDefault].files[idxFileDefault].path; // 给一个默认对比的文件
            this.fileList[idxDefault].isOpen = true;
            this.fileList[idxDefault].isOpenTitle = true;
            this.fileList[idxDefault].isActive = true;
            this.fileList[idxDefault].files[idxFileDefault].isActive = true;
            const currentType = this.fileList[idxDefault].label;
            this.currentFile !== 'Notes'
              ? this.diffInsfile.getFileInfo(this.currentFile, currentType, [])
              : this.diffInsfile.getFileInfo(this.currentFile, currentType, this.fileList[idxDefault].notes);
          }
          this.showData = this.fileList;
          // 重组列表树需要的数据
          this.showData.forEach((el: any, idx: number) => {
            el.type = el.label;
            el.label = el.name;
            el.expanded = true;
            el.children = [];
            el.children.push({
              label: el.sourceDir,
              expanded: true,
              children: el.files
            });
            el.children[0].children.forEach((eu: any) => {
              eu.label = eu.path.slice(this.sourceDir.length);
              if (eu.path === this.currentFile) {
                if (el.children[0].children.length === 1) {
                  el.children[0].checked = true;
                  el.checked = true;
                } else {
                  el.children[0].checked = 'indeterminate';
                  el.checked = 'indeterminate';
                }
                eu.checked = true;

                this.downLoadAble = true;
              }
            });
          });
        });
      }
      this.msgService.getMessage().subscribe(msg => {
        this.showData.forEach((el: any, idx: number) => {
          el.children[0].children.forEach((eu: any) => {
            if (eu.path === msg.filepath) {
              eu.isModify = true;
            }
          });
        });
      });
    });
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
   * @param dir 每个文件类型的第一个值中的路径
   */
  handleSourceDir(dir: string): string {
    let lastIdx;
    let sourceDir;
    let midSourceDir; // 中间件
    let filePath; // 具体扫描的文件名
    lastIdx = dir.lastIndexOf('sourcecode/');
    sourceDir = dir.slice(0, lastIdx) + 'sourcecode/';
    midSourceDir = dir.slice(sourceDir.length);
    filePath = midSourceDir.slice(0, midSourceDir.indexOf('/')) + '/';
    sourceDir += filePath;
    return sourceDir;
  }

  toggleTitle(current: any) {
    current.isOpenTitle = !current.isOpenTitle;
  }

  toggleFiles(current: any) {
    current.isOpen = !current.isOpen;
    if (current.files.length === 0) { return; }

    if (current.isOpen) {
      current.files.forEach((file: any) => {
        file.isActive = false;
      });

      if (this.isActiveItem.label && this.isActiveItem.label === current.label) {
        current.files[this.isActiveItem.index].isActive = true;
        this.currentFile = current.files[this.isActiveItem.index].path;
      }
    }
  }

  /**
   * 获取64位迁移预检信息
   */
  getCurrentCheckFile(idx: any, files: any, type: any, index: any, modalTemplate: any) {
    let fileName;
    for (const file of files) {
      const element = file;
      if (element.isActive === true) {
        fileName = element.path;
        sessionStorage.setItem('filename', fileName);
        break;
      }
    }
    this.closefileName = fileName;
    this.giveupfilename = fileName;
    const flag = sessionStorage.getItem('editFlag');
    if (flag === 'true') {
      this.tiModal.open(modalTemplate, {
        id: 'changeWeb',
        modalClass: 'modal400',
        close: (): void => {
          this.fileList.forEach(item => {
            item.isActive = false;
            item.files.forEach((file: any) => {
              file.isActive = false;
            });
          });

          files[index].isActive = true;
          this.fileList[idx].isActive = true;
          this.isActiveItem = {
            label: type,
            index
          };
          sessionStorage.setItem('editFlag', 'false');
          if (files[index].path !== 'Notes') {
            this.currentFile = files[index].path;
            this.diffIns.getCheckFileInfo(this.currentFile, type, []);
          } else {
            this.diffIns.getCheckFileInfo(this.currentFile, type, this.fileList[0].notes);
          }
        },
        dismiss: (): void => {}
      });
    } else {
      this.fileList.forEach(item => {
        item.isActive = false;
        item.files.forEach((file: any) => {
          file.isActive = false;
        });
      });

      files[index].isActive = true;
      this.fileList[idx].isActive = true;
      this.isActiveItem = {
        label: type,
        index
      };
      if (files[index].path !== 'Notes') {
        this.currentFile = files[index].path;
        this.diffIns.getCheckFileInfo(this.currentFile, type, []);
      } else {
        this.diffIns.getCheckFileInfo(this.currentFile, type, this.fileList[0].notes);
      }
    }
  }

  /**
   * 点击对齐检查触发
   */
  getCurrentCheckFileDQJC(idx: any, files: any, type: any, index: any, modalTemplate: any) {
    let fileName = '';
    const file = files.find((item: any) => item.isActive);
    if (file && file.path) {
      fileName = file.path;
      sessionStorage.setItem('filename', fileName);
    }
    this.closefileName = fileName;
    this.giveupfilename = fileName;
    this.fileList.forEach(item => {
      item.isActive = false;
      item.files.forEach((fileItem: any) => {
        fileItem.isActive = false;
      });
    });

    this.fileList[idx].isActive = true;
    files[index].isActive = true;
    this.isActiveItem = {
      label: type,
      index
    };
    this.diffInsByte.getByteAlignmentInfo(files[index].path, this.report.id);
  }

  /**
   * 获取缓存行
   */
  getCurrentCheckFileCacheLine(idx: any, files: any, type: any, index: any, modalTemplate: any) {
    let fileName;
    for (const file of files) {
      const element = file;
      if (element.isActive === true) {
        fileName = element.path;
        sessionStorage.setItem('filename', fileName);
        break;
      }
    }
    this.closefileName = fileName;
    this.giveupfilename = fileName;
    const flag = sessionStorage.getItem('editFlag');
    if (flag === 'true') {
      this.tiModal.open(modalTemplate, {
        id: 'changeWeb',
        modalClass: 'modal400',
        close: (): void => {
          this.fileList.forEach(item => {
            item.isActive = false;
            item.files.forEach((file: any) => {
              file.isActive = false;
            });
          });

          files[index].isActive = true;
          this.fileList[idx].isActive = true;
          this.isActiveItem = {
            label: type,
            index
          };
          sessionStorage.setItem('editFlag', 'false');
          if (files[index].path !== 'Notes') {
            this.currentFile = files[index].path;
            this.diffInsCacheLine.getCacheLineInfo(this.currentFile, type, []);
          } else {
            this.diffInsCacheLine.getCacheLineInfo(this.currentFile, type, this.fileList[0].notes);
          }
        },
        dismiss: (): void => {}
      });
    } else {
      this.fileList.forEach(item => {
        item.isActive = false;
        item.files.forEach((file: any) => {
          file.isActive = false;
        });
      });

      files[index].isActive = true;
      this.fileList[idx].isActive = true;
      this.isActiveItem = {
        label: type,
        index
      };
      if (files[index].path !== 'Notes') {
        this.currentFile = files[index].path;
        this.diffInsCacheLine.getCacheLineInfo(this.currentFile, type, []);
      } else {
        this.diffInsCacheLine.getCacheLineInfo(this.currentFile, type, this.fileList[0].notes);
      }
    }
  }

  displayFileList() {
    this.isFileList = !this.isFileList;
    this.confirmFileList.emit(this.isFileList);
    if (this.diffInsfile) {this.diffInsfile.layout(); }
    if (this.diffIns) {this.diffIns.layout(); }
    if (this.diffInsByte) {this.diffInsByte.layout(); }
    if (this.diffInsCacheLine) {this.diffInsCacheLine.layout(); }
  }

  /*
   * 获取源代码和若内存序文件
   */
  getCurrentFile(idx: any, files: any, type: any, index: any, modalTemplate: any) {
    let fileName;
    for (const file of files) {
      const element = file;
      if (element.isActive === true) {
        fileName = element.path;
        this.filePath = fileName;
        break;
      }
    }
    sessionStorage.setItem('fileType', type);
    this.giveupfilename = sessionStorage.getItem('currentfilename');
    this.closefileName = fileName;
    const flag = sessionStorage.getItem('editFlag');
    if (flag === 'true') {
      this.tiModal.open(modalTemplate, {
        id: 'changeWebfile',
        modalClass: 'del-report',
        close: (): void => {
          this.fileList.forEach(item => {
            item.isActive = false;
            item.files.forEach((file: any) => {
              file.isActive = false;
            });
          });
          sessionStorage.setItem('editFlag', 'false');
          sessionStorage.setItem('currentfilename', files[index].path);
          files[index].isActive = true;
          this.fileList[idx].isActive = true;
          this.isActiveItem = {
            label: type,
            index
          };

          if (files[index].path !== 'Notes') {
            this.currentFile = files[index].path;
            this.diffInsfile.getFileInfo(this.currentFile, type, []);
          } else {
            this.diffInsfile.getFileInfo(this.currentFile, type, this.fileList[0].notes);
          }
        },
        dismiss: (): void => {}
      });
    } else {
      this.fileList.forEach(item => {
        item.isActive = false;
        item.files.forEach((file: any) => {
          file.isActive = false;
        });
      });

      files[index].isActive = true;
      this.fileList[idx].isActive = true;
      sessionStorage.setItem('currentfilename', files[index].path);
      this.isActiveItem = {
        label: type,
        index
      };
      if (files[index].path !== 'Notes') {
        this.currentFile = files[index].path;
        this.diffInsfile.getFileInfo(this.currentFile, type, []);
      } else {
        this.diffInsfile.getFileInfo(this.currentFile, type, this.fileList[0].notes);
      }
    }
  }

  findSearchList(data: any) {
    const fileCopy = this.deepCopy(this.fileList);
    if (!data) {
      this.downLoadAble = false;
      this.showData.forEach((el) => {
        el.checked = false;
      });
    }
    this.originFiles.forEach((origin: any, index: any) => {
      if (!fileCopy[index]) {  return; }
      fileCopy[index].files = [];
      fileCopy[index].isOpen = false;
      fileCopy[index].isOpenTitle = false;
      fileCopy[index].isActive = false;
      origin.files.forEach((current: any, j: any) => {
        fileCopy[index].files.push({
          path: current,
          isActive: false
        });
      });
    });
    fileCopy.forEach((itemFile: any, index: any) => {
      let filterFiles = [];
      filterFiles = itemFile.files.filter((item: any) => {
        const pathStr = item.path.toLowerCase();
        return pathStr.indexOf(data.toLowerCase()) >= 0;
      });
      itemFile.files = filterFiles;
    });
    const curIndex = fileCopy.findIndex((item: any) => {
      return item.files.length > 0;
    });
    // 未搜索到数据
    if (!fileCopy[curIndex]) {
      if (!this.routerFileDQJC && !this.routerFile && !this.routerFileCacheLine) {
        this.diffInsfile.getFileInfo(this.currentFile, fileCopy[0].label, []);
      }
      if (this.routerFileDQJC) {
        this.diffInsByte.getByteAlignmentInfo(this.currentFile, this.report.id);
      }
      if (this.routerFile) {
        this.diffIns.getCheckFileInfo(this.currentFile, fileCopy[0].label, []);
      }
      if (this.routerFileCacheLine) {
        this.diffInsCacheLine.getCacheLineInfo(this.currentFile, fileCopy[0].label, []);
      }
      this.showData = [];
      this.downLoadAble = false;
      return;
    }
    if (fileCopy[curIndex].files[0].path === 'Notes') {
      this.diffInsfile.getFileInfo(this.currentFile, fileCopy[curIndex].type, fileCopy[curIndex].notes);
    } else {
      this.currentFile = fileCopy[curIndex].files[0].path;
      if (!this.routerFileDQJC && !this.routerFile && !this.routerFileCacheLine) {
        this.diffInsfile.getFileInfo(this.currentFile, fileCopy[curIndex].type, []);
      }
      if (this.routerFileDQJC) {
        this.diffInsByte.getByteAlignmentInfo(this.currentFile, this.report.id);
      }
      if (this.routerFile) {
        this.diffIns.getCheckFileInfo(this.currentFile, fileCopy[curIndex].type, []);
      }
      if (this.routerFileCacheLine) {
        this.diffInsCacheLine.getCacheLineInfo(this.currentFile, fileCopy[curIndex].type, []);
      }
    }
    fileCopy[curIndex].files[0].isActive = true;
    fileCopy[curIndex].isActive = true;
    fileCopy[curIndex].isOpen = true;
    fileCopy[curIndex].isOpenTitle = true;
    sessionStorage.setItem('currentfilename', fileCopy[curIndex].files[0].path);
    this.isActiveItem = {
      label: fileCopy[curIndex].type,
      index: curIndex
    };
    // 重组列表树需要的数据
    this.showData = fileCopy.filter((item: any) => {
      return item.files.length > 0;
    });
    this.showData.forEach((el: any, idx: number) => {
      el.type = el.type;
      el.label = el.name;
      el.expanded = true;
      el.children = [];
      el.children.push({
        label: this.sourceDir,
        expanded: true,
        children: el.files
      });
      el.children[0].children.forEach((eu: any) => {
        eu.label = eu.path.slice(this.sourceDir.length);
      });
    });
  }

  /**
   * 监听搜索字符串的改变
   * @param event 搜索字符串
   */
  public onChange(event: string): void {
    if (event === '') {
        //  如果搜索字符串清空，那么tree设置为原始数据。
        this.findSearchList('');
        this.downLoadAble = false;
        this.showData.forEach((el) => {
          el.checked = false;
        });
    }
  }

  /*
    * 在搜索结果中的每一次勾选，需要同步到原始数据也勾选
  */
  public onSelect(node: TiTreeNode, modalTemplate: any): void {
    this.showData.forEach((el: any, i: number) => {
      el.children.forEach((ei: any, idx: number) => {
        ei.children.forEach((eu: any, index: number) => {
          if (node.path === eu.path) {
            if (!this.routerFile && !this.routerFileDQJC && !this.routerFileCacheLine) {
              // 源代码若内存序
              this.getCurrentFile(i, ei.children, el.type, index, modalTemplate);
            } else if (this.routerFile) {
              // 64位迁移预检
              this.getCurrentCheckFile(i, ei.children, el.type, index, modalTemplate);
            } else if (this.routerFileDQJC) {
              // 字节对齐
              this.getCurrentCheckFileDQJC(i, ei.children, el.type, index, modalTemplate);
            } else if (this.routerFileCacheLine){
              this.getCurrentCheckFileCacheLine(i, ei.children, el.type, index, modalTemplate);
            }
          }
        });
      });
    });
  }

  changeFn(event: TiTreeNode): void {
    let selectedData = [];
    selectedData = TiTreeUtil.getSelectedData(this.showData, true, true);
    if (selectedData.length > 0) {
      this.downLoadAble = true;
    } else {
      this.downLoadAble = false;
    }
  }

  /**
   * 下载文件
   * @param modalTemplate 修改提示模板
   */
  public dowload(modalTemplate: any): void {
    if (!this.downLoadAble) {
      return;
    }
    const flag = sessionStorage.getItem('editFlag');
    // 代码改动禁止下载，弹出弹窗
    if (flag === 'true') {
      this.tiModal.open(this.saveEditorModal, {
        id: 'saveModal',
        modalClass: 'del-report',
        close: (): void => {
          sessionStorage.setItem('editFlag', 'false');
          this.dowload('');
          this.findSearchList('');
        },
        dismiss: (): void => { }
      });
      return;
    } else {
      this.showTip = true;
      setTimeout(() => {
        this.showTip = false;
      }, 3000);
    }
    const params = {
      task_id: this.report.id,
      file_list: [] as Array<any>,
    };
    this.showData.forEach((el: any) => {
      el.files.forEach((ei: any) => {
        if (ei.checked === true) {
          params.file_list.push(ei.path);
        }
      });
    });
    // 设置下载文件流
    const options = {
      'Content-Type' : 'application/json;application/octet-stream',
    };
    this.Axios.axios.post(`/portadv/tasks/download_file/`, params, {headers: options, responseType: 'blob'})
      .then((data: any) => {
        if (!data.status) {
          const link = document.createElement('a');
          const content = new Blob([data], {type : 'application/octet-stream'});
          // for IE
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(content, this.report.id + '.zip');
          } else {
            link.href = URL.createObjectURL(content);
            link.download = this.report.id + '.zip';
            document.body.appendChild(link);
            link.setAttribute('style', 'visibility:hidden');
            link.click();
            document.body.removeChild(link);
          }
      }
    });
  }

  /**
   * 递归实现深拷贝
   * @param target 待拷贝对象
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
}
