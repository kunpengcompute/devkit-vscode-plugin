import { Component, OnInit, Input } from '@angular/core';
import 'node_modules/diff2html/bundles/css/diff2html.min.css';

@Component({
  selector: 'app-diff',
  templateUrl: './diff.component.html',
  styleUrls: ['./diff.component.scss']
})
export class DiffComponent implements OnInit {
  @Input() currentFile: any;
  public fileName = '';
  public oldString: string;
  public newString: string;
  public context = 10000000000;
  public maxLineLengthHighlight = 100000;
  public resultHTML: any = null;
  public Diff2Html: any = (window as any).Diff2Html;
  public formate = 'line-by-line';
  public diffList: Array<any> = [];
  public diffData: any = {
    resultHTML: null
  };
  constructor() { }

  ngOnInit() {
    this.newString = '';
  }
  public diff(currentFile: { fileName: string; content: string; }) {
    this.diffData.resultHTML = null;
    this.fileName = currentFile.fileName;
    this.oldString = currentFile.content;

    function hljs(html: any) {
      return html.replace(/<div class="d2h-file-list-wrapper">/g,
        '<div class="d2h-file-list-wrapper" style="display: none;">');
    }
    const dd2 = this.myCreatePatch(this.oldString);
    const Diff2html = require('diff2html');
    const outStr = Diff2html.html(
      dd2,
      {
        inputFormat: 'diff', outputFormat: this.formate, showFiles: false,
        matching: 'lines', maxLineLengthHighlight: this.maxLineLengthHighlight
      }
    );
    this.diffData.resultHTML = hljs(outStr);
  }
  public myCreatePatch(content: any) {
    let res = '';
    const length = content.split('\n').length;
    res = '-' + content;
    res = this.replaceAll(res, '\n', '\n-');
    res =
      `Index: \n===================================================================\n---   \n+++   \n@@ -1,` +
      `${length} +1,0 @@\n` +
      res; // 里面的空格不可去掉
    return res;
  }
  public replaceAll(str: any, s1: any, s2: any) {
    return str.replace(new RegExp(s1, 'gm'), s2);
  }

}
