import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { I18nService } from 'sys/src-com/app/service/i18n.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { LoadingScene } from '../../domain';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent implements OnInit, OnDestroy {
  /**
   * 场景类型:
   *  1、全局场景【axios loading】，container宽高：100px；圆圈半径：25px；遮罩层背景色为rgba(0, 0, 0, 0.1)
   *  2、局部场景【表格 loading】，container宽高：56px；圆圈半径：14px；遮罩层背景色为rgba(255, 255, 255, 0.6)
   */
  @Input() scene: LoadingScene = LoadingScene.LOCAL;
  /** loading下方的文字显示 */
  @Input() loadingText: string;

  public i18n: any;
  private subscription: any;
  public circleNum = 8;
  public circleBoxWidth: number;
  public circleItemWidth: number;
  /** 全局loading状态下不显示局部loading */
  public showLoading: boolean;

  constructor(
    public i18nService: I18nService,
    private cdr: ChangeDetectorRef,
    private msgService: MessageService,

  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    if (this.scene === LoadingScene.GLOBAL) {
      this.circleBoxWidth = 100;
      this.circleItemWidth = 25;

      this.showLoading = true;
    } else {
      this.circleBoxWidth = 56;
      this.circleItemWidth = 14;

      this.subscription = this.msgService.getMessage().subscribe(msg => {
        if (msg.type === 'globalLoadingStatus') {
          this.showLoading = !msg.data;
          this.cdr.markForCheck();
        }
      });

      this.msgService.sendMessage({
        type: 'getGlobalLoadingStatus',
        data: true,
      });
    }

    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.msgService.sendMessage({
        type: 'getGlobalLoadingStatus',
        data: false,
      });

      this.subscription.unsubscribe();
    }
  }
}
