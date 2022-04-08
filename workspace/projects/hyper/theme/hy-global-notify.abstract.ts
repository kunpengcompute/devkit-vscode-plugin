import {
  Subscription, PartialObserver, BehaviorSubject, Observable
} from 'rxjs';
import { Cat } from '../util';

/**
 *  通知服务
 */
export abstract class HyGlobalNotify<T> {

  private sourceKey: string;

  constructor(id: string) {

    this.sourceKey = 'hyGlobalNotifySource_' + id;

    if (Cat.isNil((window as any)[this.sourceKey])) {

      const hyGlobalNotifySource = new BehaviorSubject<T>(void 0);
      (window as any)[this.sourceKey] = hyGlobalNotifySource;
    }
  }

  notify(state: T) {

    this.getNotifySource()?.next(state);
  }

  subscribe(fn: (msg: T) => any): Subscription {

    const notifyObserver: PartialObserver<T> = { next: fn };
    return this.getNotifySource()?.asObservable()?.subscribe(notifyObserver);
  }

  getObservable(): Observable<T> {

    return this.getNotifySource()?.asObservable();
  }

  private getNotifySource(): BehaviorSubject<T> {

    return (window as any)[this.sourceKey] as BehaviorSubject<T>;
  }
}
