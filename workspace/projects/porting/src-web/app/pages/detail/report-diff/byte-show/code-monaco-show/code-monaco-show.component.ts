import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as monaco from 'monaco-editor';
import { I18nService } from '../../../../../service/i18n.service';
@Component({
  selector: 'app-code-monaco-show',
  templateUrl: './code-monaco-show.component.html',
  styleUrls: ['./code-monaco-show.component.scss']
})
export class CodeMonacoShowComponent implements OnInit, AfterViewInit {
  @Input() code: any;
  @Input()
  set struckStep(val: any) {
    if (val && this.editor) {
      this.interact(val);
    } else if (val === 0 && this.editor) {
      this.interact(val);
    }
  }
  @Output() stepIndex = new EventEmitter<any>();
  public editor: any;
  public i18n: any;
  public markerLength: any;
  public step: any;
  public prevStr: any;
  public nextStr: any;
  public decorations: any = [];
  public newDecorations: any = [];
  constructor(public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }
  ngAfterViewInit(): void {
    this.initUI(this.code);
  }

  ngOnInit() {
    this.prevStr = this.i18n.prevStr;
    this.nextStr = this.i18n.nextStr;
  }
  public doLayout() {
    setTimeout(() => {
      this.editor.layout({
        width: document.getElementById('codes').offsetWidth - 3,
        height: document.getElementById('codes').offsetHeight - 3
      });
    }, 200);
  }

  public initUI(code: any) {
    this.editor = monaco.editor.create(document.getElementById('codes'), {
    value: code.content,
    language: 'cpp',
    glyphMargin: true,
    lineDecorationsWidth: 5,
    fontSize: 16,
    fontFamily: '方正兰亭黑,huaweisans',
    readOnly: true,
    automaticLayout: true
});
    this.initMarker(code.suggestion['32-bits']);
    this.doLayout();
  }
  public initMarker(list: any) {
    list.forEach((item: any) => {
      this.newDecorations.push({
          range: new monaco.Range(item.start_line , 1, item.start_line , 1),
          options: {
          glyphMarginClassName: 'errorIcon',
        }
      });
    });
    this.markerLength = list.length;
    this.step = -1;
    this.decorations = this.editor.deltaDecorations(this.decorations, this.newDecorations, 'cpp');
  }

  public prev() {
    this.step--;
    if (this.step < 0 || this.step === -1) {this.step = this.markerLength - 1; }
    this.editor.revealPosition({                    // 滚动到指定行号
      lineNumber: this.code.suggestion['32-bits'][this.step].start_line,
      column: 0
    });
    this.editor.setPosition({                       // 设置光标位置
      lineNumber: this.code.suggestion['32-bits'][this.step].start_line,
      column: 0
    });
    this.editor.focus();
    this.stepIndex.emit(this.step);
  }
  public next() {
    this.step++;
    if (this.step > this.markerLength || this.step === this.markerLength) {this.step = 0; }
    this.editor.revealPosition({
      lineNumber: this.code.suggestion['32-bits'][this.step].start_line,
      column: 0
    });
    this.editor.setPosition({
      lineNumber: this.code.suggestion['32-bits'][this.step].start_line,
      column: 0
    });
    this.editor.focus();
    this.stepIndex.emit(this.step);

  }
  public interact(step: any) {
    this.step = step;
    if (this.step < 0) {this.step = 0; }
    this.editor.revealPosition({                    // 滚动到指定行号
      lineNumber: this.code.suggestion['32-bits'][this.step].start_line,
      column: 0
    });
    this.editor.setPosition({                       // 设置光标位置
      lineNumber: this.code.suggestion['32-bits'][this.step].start_line,
      column: 0
    });
    this.editor.focus();
  }
}
