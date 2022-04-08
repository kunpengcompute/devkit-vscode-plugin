import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { NormalizeBlockData, POIBlockData } from './domain';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
@Component({
  selector: 'app-normalize-block',
  templateUrl: './normalize-block.component.html',
  styleUrls: ['./normalize-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NormalizeBlockComponent implements OnInit {
  @ViewChild('followTip', { static: true }) followTipTpl: TemplateRef<any>;
  @ViewChild('container', { static: true }) containerEl: ElementRef;

  /** 输入数据 */
  @Input() rawData: NormalizeBlockData;
  /** 色块字典 */
  public colors = {
    '0KB-1KB': '#FA8C16',
    '1KB-2KB': '#FFA940',
    '2KB-4KB': '#FFC069',
    '4KB-8KB': '#FFD591',
    '8KB-16KB': '#FFE7BA',
    '16KB-+∞KB': '#FFF7E6',
    '0us-32us': '#fff2e4',
    '32us-64us': '#feead4',
    '64us-128us': '#fddfbe',
    '128us-256us': '#fdd3a6',
    '256us-512us': '#fddcb7',
    '512us-1024us': '#fdd5ab',
    '1024us-2048us': '#fccd9a',
    '2048us-4096us': '#fcc78f',
    '4096us-8192us': '#fabb76',
    '8192us-16384us': '#fabb76',
    '16384us-32768us': '#fab66c',
    '32768us-65536us': '#faaf5f',
    '65536us-131072us': '#f9a953',
    '131072us-262144us': '#f9a448',
    '262144us-524288us': '#f89d3b',
    '524288us-1048576us': '#f89730',
    '1048576us-2097152us': '#f89225',
    '2097152us-4194304us': '#f78a15',
  };
  public i18n: any;
  followTipData: {
    html: string | TemplateRef<any>;
    pos: { top: number; left: number };
    context?: any;
  };
  isFollowTipShow = false;

  constructor(public i18nService: I18nService, private cdr: ChangeDetectorRef) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {}

  onBlockMouseenter(poi: POIBlockData) {
    const blockRect: DOMRectReadOnly = poi.domRect;
    const conRect: DOMRectReadOnly =
      this.containerEl.nativeElement.getBoundingClientRect();
    const top = blockRect.top - conRect.top + blockRect.height / 2;
    const left = blockRect.left - conRect.left + blockRect.width / 2;

    poi.data.percent = Math.round(poi.data.percent * 100) / 100;
    poi.data.value = Math.round(poi.data.value);
    this.followTipData = {
      html: this.followTipTpl,
      context: poi.data,
      pos: {
        top,
        left,
      },
    };

    this.isFollowTipShow = true;
    this.cdr.markForCheck();
  }

  onBlockMouseleave() {
    this.isFollowTipShow = false;
    this.cdr.markForCheck();
  }
}
