import {
  Component, OnInit, Input, Output, ViewChild, OnDestroy, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-mission-modal',
  templateUrl: './mission-modal.component.html',
  styleUrls: ['./mission-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissionModalComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * 添加 appendTarget 是因为 transform 会影响 position: fied 布局
   * 解决办法：把该drawer移到target的子级，设置为绝对定位来解决
   * 默认添加至 bodyContent 上
   */
  @Input() appendTarget = '#bodyContent';
  @Input() drawerClass = '';
  @ViewChild('modalBox') modalBox: any;
  @Output() beforeDismiss = new EventEmitter<void>();
  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  public showModal = false;
  public showContent = false;

  ngOnInit() { }

  ngAfterViewInit() {
    if (this.appendTarget) {
      const parentNode: any = document.querySelector(this.appendTarget);
      if (window.getComputedStyle(parentNode).position === 'static') {
        parentNode.style.position = 'relative';
      }
      parentNode.appendChild(this.modalBox.nativeElement);
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy() {
    if (this.appendTarget) {
      this.close().then(res => {
        const dom = this.modalBox.nativeElement;
        if (dom && dom.parentNode) {
          dom.parentNode.removeChild(dom);
          this.cdr.markForCheck();
        }
      });
    }
  }

  public open() {
    this.showModal = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.showContent = true;
      this.cdr.markForCheck();
    }, 100);
  }

  /**
   * 点击蒙版关闭
   */
  public dismiss() {
    this.beforeDismiss.emit();
    this.close();
  }

  public close() {
    return new Promise<void>((resolve, reject) => {
      if (this.showModal) {
        this.showContent = false;
        this.cdr.markForCheck();

        setTimeout(() => {
          this.showModal = false;
          this.cdr.markForCheck();
          resolve();
        }, 410);
      } else {
        resolve();
      }
    });
  }
}
