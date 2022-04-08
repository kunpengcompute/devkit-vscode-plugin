import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';

@Injectable({
    providedIn: 'root'
})

export class CloudIDEService {

    constructor() {}

    /**
     * 通过 FileSaver 下载 html 报告
     * @param res 下载内容
     * @param fileName html文件名
     */
    public downloadReportHTML(res: string, fileName: string) {
        const blob = new Blob([res], {type: 'text/plain;charset=utf-8'});
        FileSaver.saveAs(blob, fileName + '.html');
    }

    /**
     * 导出CSV文件
     * @param res 文件流
     * @param fileName 文件名
     */
    public downloadReportCsv(res: string, fileName: string) {
        const blob = new Blob([res], {
            type: 'application/vnd.ms-excel'
        });
        FileSaver.saveAs(blob, fileName + '.csv');
    }
}
