import { ComponentRef, ElementRef, Injectable } from '@angular/core';
import { TiPopupService, TiContentType } from '@cloud/tiny3';
import { HyNodataRef } from './hy-nodata-ref.interface';
import { HyNodataShowConfig } from './hy-nodata-show-config.interface';
import { NodataComponent } from './nodata.component';

/**
 * @ignore
 * popup show方法配置
 */
interface TiPopUpShowConfig {
  content?: TiContentType; // 弹出组件内容
  context?: any; // 弹出组件上下文
  contentContext?: any; // 内容部分的组件上下文
  contentAsText?: boolean; // 当弹出组件内容为string类型时，是否只当做普通字符串文本渲染
  container?: any; // 弹出组件最终放置的容器位置
}

@Injectable()
export class HyNodataService {

  constructor(
    private tiPopupService: TiPopupService<NodataComponent>
  ) { }

  create(hostEle: ElementRef): HyNodataRef {

    const tiPopupRef = this.tiPopupService.create(NodataComponent);

    return {
      show: (hyShowConfig: HyNodataShowConfig)
        : ComponentRef<NodataComponent> => {

        const showConfig: TiPopUpShowConfig = {
          container: hostEle
        };

        const tiPopup = tiPopupRef.show(showConfig);
        (tiPopup.instance as NodataComponent).showConfig = hyShowConfig;

        return tiPopup;
      },

      hide: () => {
        tiPopupRef.hide();
      },

      destroy: () => {
        tiPopupRef.hide();
      }
    };
  }
}
