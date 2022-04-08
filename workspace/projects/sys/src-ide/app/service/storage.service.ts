import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor() { }

    /**
     * 设置sessionStorage缓存
     * @param key 缓存key
     * @param value 缓存值
     */
    set(key: string, value: any) {
        self.webviewSession.setItem(key, JSON.stringify(value));
    }

    /**
     * 获取sessionStorage缓存
     * @param key 缓存key
     */
    get(key: string) {
        return JSON.parse(self.webviewSession.getItem(key));
    }

    /**
     * 删除sessionStorage缓存
     * @param key 缓存key
     */
    remove(key: string) {
        self.webviewSession.removeItem(key);
    }
}
