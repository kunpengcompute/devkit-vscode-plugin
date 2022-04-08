import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ViewDetailsService {
    public subject = new Subject<any>();
    public tpswitchColumn: any[];
    public tpswitchOriginData: any[];
    public tpswitchTotal: number;
    public tpCurrentPage: number;
    public tpStatus: any;
    public tpSize: number;
    public topList10: any[];
    constructor() { }

    /**
     * 转换 asc | desc | 'none' 为 true | false | null
     * @param sortStatus 任务id
     */
    public calcSortStatus(sortStatus: any) {
        return sortStatus === 'asc' ? true : sortStatus === 'desc' ? false : null;
    }
}
