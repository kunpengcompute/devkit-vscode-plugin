import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { TiFormComponent } from '@cloud/tiny3';
import { HyTiTipDirective } from '../../directive/ti-tip/hy-ti-tip.directive';

@Component({
  selector: 'hy-popup-search',
  templateUrl: './popup-search.component.html',
  styleUrls: ['./popup-search.component.scss'],
  providers: [TiFormComponent.getValueAccessor(HyPopupSearchComponent)],
})
export class HyPopupSearchComponent extends TiFormComponent {
  @ViewChild('searchTip', { static: true }) searchTipRef: HyTiTipDirective;

  /**
   * search事件，当选中下拉选项/按enter键/点击搜索图标时触发
   *
   * 参数：搜索框文本
   */
  @Output() readonly search: EventEmitter<string> = new EventEmitter<string>();
  /**
   * clear事件，点击删除按钮时触发
   *
   */
  @Output() readonly clear: EventEmitter<MouseEvent> = new EventEmitter();

  /**
   * 搜索是否在展示
   */
  isSearchShow = false;

  /**
   * @ignore
   * 搜索事件触发
   */
  onSearch(value: any): void {
    this.search.emit(value);
  }
  /**
   * @ignore
   * 点击叉号时触发
   *
   */
  onClear(event: MouseEvent): void {
    this.clear.emit(event);
  }
  /**
   * @ignore
   * 点击叉号时触发
   *
   */
  onIconClick() {
    this.showTip();
  }
  /**
   * @ignore
   * 聚焦时触发
   */
  onFocus(): void {
    this.isSearchShow = true;
  }

  /**
   * @ignore
   * 失焦时触发
   */
  onBlur(): void {
    this.isSearchShow = false;
    this.hideTip();
  }

  private hideTip() {
    this.searchTipRef.hide();
  }

  private showTip() {
    const tipCompRef = this.searchTipRef.show();
    const searchInput = tipCompRef.location.nativeElement.querySelector(
      'input'
    ) as HTMLElement;
    if (searchInput) {
      searchInput.focus();
    }
  }
}
