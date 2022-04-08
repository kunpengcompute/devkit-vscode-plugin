import {
  Component, OnInit, Input, OnChanges, SimpleChanges,
  ElementRef, OnDestroy, AfterViewChecked, AfterViewInit
} from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { MemLeakType, FuncProps, FunctionSourceInfo } from '../../doman';
import * as monaco from 'monaco-editor';
import { Subscription } from 'rxjs';
import { TabSwitchService } from '../../service/tab-switch.service';
import { HyTheme, HyThemeService } from 'hyper';

@Component({
  selector: 'app-source-code-viewer',
  templateUrl: './source-code-viewer.component.html',
  styleUrls: ['./source-code-viewer.component.scss']
})
export class SourceCodeViewerComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked, AfterViewInit {
  @Input() notJump = false;
  /** 是否是在模态弹窗中显示 */
  @Input() isModal = false;
  @Input() memLeakType: MemLeakType;
  @Input() data: {
    currActiveFunc: FuncProps;
    functionSourceInfo: FunctionSourceInfo;
  };

  private currLineIndex = -1;
  private markLines: number[] = [];

  public i18n: any;
  public editor: monaco.editor.IStandaloneCodeEditor;
  private currActiveLine: number;
  private monacoEditorTheme: 'vs' | 'vs-dark' = 'vs';
  private tabSwitchServiceSub: Subscription;

  constructor(
    private i18nService: I18nService,
    private el: ElementRef<HTMLDivElement>,
    private tabSwitchService: TabSwitchService<any>,
    private themeServe: HyThemeService,
  ) {
    this.i18n = this.i18nService.I18n();

    this.tabSwitchServiceSub = this.tabSwitchService.showSourceSlider.subscribe({
      next: (data) => {
        if (!this.notJump) {
          this.currActiveLine = data.line;
          this.jumpLine(this.currActiveLine);
        }
      }
    });

    if (document.body.className.includes('vscode-dark')) {
      this.monacoEditorTheme = 'vs-dark';
    } else {
      this.monacoEditorTheme = 'vs';
    }

    this.themeServe.subscribe((msg) => {
      switch (msg) {
        case HyTheme.Dark:
          this.monacoEditorTheme = 'vs-dark';
          break;
        case HyTheme.Light:
          this.monacoEditorTheme = 'vs';
          break;
        default: break;
      }
      monaco.editor.setTheme(this.monacoEditorTheme);
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.editor = monaco.editor.create(this.el.nativeElement.querySelector('#code-viwer'), {
      value: '',
      language: 'cpp',
      glyphMargin: true,
      fontSize: 14,
      readOnly: true,
      theme: this.monacoEditorTheme, // 主题
      lineNumbersMinChars: 5, // 行号最大位数
      automaticLayout: true, // 设置宽度自适应
      lineDecorationsWidth: '72px',
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.currLineIndex = -1;
    if (changes.data) {
      this.editor?.setValue(this.data?.functionSourceInfo?.sourcecode || '');

      this.markLines = [];
      const decorations: monaco.editor.IModelDeltaDecoration[] = [];
      if (this.data?.functionSourceInfo?.selfline) {
        for (const line of Object.keys(this.data.functionSourceInfo.selfline)) {
          if (+line < 0) { continue; }
          const leakIconClass = 'self-icon line-' + line;
          decorations.push({
            range: new monaco.Range(+line, 1, +line, 100),
            options: {
              glyphMarginClassName: this.memLeakType === 3 ? 'light-icon' : leakIconClass,
              glyphMarginHoverMessage: { value: `${this.data.functionSourceInfo.selfline[+line].join?.(' ')}` }
            }
          });
          this.markLines.push(+line);
        }
      }
      if (this.data?.functionSourceInfo?.childline) {
        for (const line of Object.keys(this.data.functionSourceInfo.childline)) {
          if (+line < 0) { continue; }
          const leakIconClass = 'child-icon line-' + line;
          decorations.push({
            range: new monaco.Range(+line, 1, +line, 100),
            options: {
              glyphMarginClassName: leakIconClass,
            }
          });
          this.markLines.push(+line);
        }
      }
      this.markLines.sort();
      this.editor?.deltaDecorations([], decorations);
    }
    if (changes.memLeakType) {
      this.currActiveLine = null;
      const previousIsLeak = [MemLeakType.leakCount, MemLeakType.leakSize].includes(changes.memLeakType.previousValue);
      const currentIsLeak = [MemLeakType.leakCount, MemLeakType.leakSize].includes(changes.memLeakType.currentValue);
      // 如果不是泄露大小和泄露次数的变更，则重置编辑器的内容，并重新调整编辑器的大小
      if (previousIsLeak !== currentIsLeak) {
        this.editor?.setValue('');
        this.editor?.layout();
      }
    }
  }

  ngAfterViewChecked(): void {
    this.addTimesFont();
  }

  private addTimesFont() {
    const codeViwerEl: HTMLDivElement = this.el.nativeElement.querySelector('#code-viwer');
    const selfLeakElList = codeViwerEl.getElementsByClassName('self-icon');
    const childLeakElList = codeViwerEl.getElementsByClassName('child-icon');
    for (let i = 0; i < selfLeakElList.length; i++) {
      const el = selfLeakElList.item(i);
      const lineClass = Array.from(el.classList).find(item => item.startsWith('line-'));
      const line = +lineClass.split('-')[1];
      if (this.memLeakType === MemLeakType.leakCount || this.memLeakType === MemLeakType.abnormalRelease) {
        el.innerHTML = this.data.functionSourceInfo.selfline[line].count + '';
      } else if (this.memLeakType === MemLeakType.leakSize) {
        el.innerHTML = this.data.functionSourceInfo.selfline[line].size + '';
      }
      if (line === this.currActiveLine) {
        el.classList.add('active-line');
      } else {
        el.classList.remove('active-line');
      }
    }
    for (let i = 0; i < childLeakElList.length; i++) {
      const el = childLeakElList.item(i);
      const lineClass = Array.from(el.classList).find(item => item.startsWith('line-'));
      const line = +lineClass.split('-')[1];
      if (this.memLeakType === MemLeakType.leakCount || this.memLeakType === MemLeakType.abnormalRelease) {
        el.innerHTML = this.data.functionSourceInfo.childline[line].count + '';
      } else if (this.memLeakType === MemLeakType.leakSize) {
        el.innerHTML = this.data.functionSourceInfo.childline[line].size + '';
      }
      if (line === this.currActiveLine) {
        el.classList.add('active-line');
      } else {
        el.classList.remove('active-line');
      }
    }
  }

  public jumpUpLine() {
    this.currLineIndex--;
    if (!this.markLines[this.currLineIndex]) {
      this.currLineIndex = 0;
    }
    this.jumpLine(this.markLines[this.currLineIndex]);
  }

  public jumpDownLine() {
    this.currLineIndex++;
    if (!this.markLines[this.currLineIndex]) {
      this.currLineIndex = this.markLines.length - 1;
    }
    this.jumpLine(this.markLines[this.currLineIndex]);
  }

  public jumpLine(line: number) {
    setTimeout(() => {
      this.editor?.revealPosition({  // 滚动到指定行号
        lineNumber: line,
        column: 0
      });
      this.editor?.setPosition({    // 设置光标位置
        lineNumber: line,
        column: 0
      });
      this.editor?.focus();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.tabSwitchServiceSub.unsubscribe();
  }
}
