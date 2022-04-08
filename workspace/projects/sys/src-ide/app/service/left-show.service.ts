import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class LeftShowService {
    public leftIfShow = new Subject<boolean>();
    public timelineUPData = new Subject<object>();
    constructor() { }
}
