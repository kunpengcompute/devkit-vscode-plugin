import {
  Injectable, ComponentRef, Injector, EmbeddedViewRef,
  ComponentFactoryResolver, ApplicationRef
} from '@angular/core';
import { LoadingComponent } from '../component/loading/loading.component';
import { LoadingScene } from '../domain/index';

@Injectable({
  providedIn: 'root'
})
export class CreateLoadingRefService {

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private applicationRef: ApplicationRef,
  ) { }

  /**
   * 创建loading component
   * @param parentDom 要添加到的地方
   * @param scene 场景类型: 全局场景 | 局部场景
   * @param loadingText loading下方的文字显示
   */
  public createLoading(parentDom: any, scene: LoadingScene, loadingText?: string): ComponentRef<LoadingComponent> {
    const factory = this.componentFactoryResolver.resolveComponentFactory(LoadingComponent); // 生成 ComponentFactory
    const loadingRef = factory.create(this.injector); // 创建一个新的 NoDataComponent
    const embeddedView: EmbeddedViewRef<LoadingComponent> =
      loadingRef.hostView as EmbeddedViewRef<LoadingComponent>; // LoadingComponent 的视图实例

    Object.assign(loadingRef.instance, { scene, loadingText }); // 给 LoadingComponent 的实例中的option参数赋值
    this.applicationRef.attachView(embeddedView); // Attaches a view so that it will be dirty checked.

    // 将 NoDataComponent 的实例插入当前的 ElementRef 中
    for (const rootView of embeddedView.rootNodes) {
      parentDom.appendChild(rootView);
    }

    return loadingRef;
  }

  /**
   * 销毁动画，只限销毁this.loadingDom，全局的请自行销毁
   * @param loadingRef loadingRef
   */
  public destroyLoading(loadingRef: ComponentRef<LoadingComponent>) {
    if (loadingRef) {
      loadingRef.destroy();
    }
  }
}
