import { Component, Input } from '@angular/core';
import * as Util from 'sys/src-com/app/util';
import { ExplorerType } from 'sys/src-com/app/domain';

@Component({
  selector: 'app-static-tip-for-ie',
  templateUrl: './static-tip-for-ie.component.html',
  styleUrls: ['./static-tip-for-ie.component.scss']
})
export class StaticTipForIEComponent {
  @Input() tipContent: string;
  isIE = Util.judgeExplorer() === ExplorerType.IE;

  constructor() { }
}
