import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../../../../service/i18n.service';
import { LoadingScene } from '../../domain';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent implements OnInit {
  /**
   * 场景类型:
   *  1、全局场景【axios loading】，container宽高：100px；圆圈半径：25px
   *  2、局部场景【表格 loading】，container宽高：56px；圆圈半径：14px
   */
  @Input() scene: LoadingScene = LoadingScene.LOCAL;
  /** loading下方的文字显示 */
  @Input() loadingText: string;

  public i18n: any;
  public circleNum = 8;
  public circleBoxWidth: number;
  public circleItemWidth: number;

  constructor(public i18nService: I18nService, private cdr: ChangeDetectorRef) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    if (this.scene === LoadingScene.GLOBAL) {
      this.circleBoxWidth = 100;
      this.circleItemWidth = 25;
    } else {
      this.circleBoxWidth = 56;
      this.circleItemWidth = 14;
    }

    this.cdr.markForCheck();
  }
}
