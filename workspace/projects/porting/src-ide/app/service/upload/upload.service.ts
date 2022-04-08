import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UploadService {

    constructor() { }

    /**
     * 判断上传的软件包中是否有 aarch64 与 arm64
     * @param fileName 文件名
     */
    isIncludeAarch64(fileName: string | Array<object>): boolean | void {
        const reg = /(aarch64)|(arm64)/ig;
        if (typeof (fileName) === 'string') {
            return reg.test(fileName);
        } else {
            return false;
        }
    }
}

// 压缩包上传支持类型
const ACCEPT_TYPE = {
    softwareMigration: '.deb,.egg,.gz,.jar,.rpm,.tar,.tar.bz,.tar.gz,.tbz,.tbz2,.tgz,.war,.whl,.zip',
    sourceMigration: '.gz,.tar,.tar.bz,.tar.bz2,.tar.gz,.tar.xz,.tbz,.tbz2,.tgz,.txz,.zip',
    softwareRebuild: '.deb,.rpm',
    byteAlignment: '.tar,.tar.bz,.tar.bz2,.tar.gz,.tar.xz,.tbz,.tbz2,.tgz,.txz,.zip', // 64位迁移预检和字节对齐
    weakCheck: '.bz,.bz2,.gz,.tar,.tar.bz2,.tar.gz,.zip'
};

export {
    ACCEPT_TYPE
};
