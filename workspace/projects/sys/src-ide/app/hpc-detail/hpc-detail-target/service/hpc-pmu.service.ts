import { Injectable } from '@angular/core';
import { VscodeService, HTTP_STATUS_CODE } from '../../../service/vscode.service';

@Injectable({
    providedIn: 'root'
})
export class HpcPmuService {

    constructor(
        public vscodeService: VscodeService
    ) { }
    /**
     * 获取数据
     */
    getPMUdata(taskId, nodeId): Promise<{ coreData: any[], uncoreData: any[] }> {
        return new Promise<any>((resolve, reject) => {
            const url = `/tasks/${taskId}/hpc-analysis/pmu-event/?node-id=${nodeId}&query-type=pmu-event`;
            this.vscodeService.get({ url }, (res) => {
                const coreData: Array<any> = [];
                const uncoreData: Array<any> = [];
                if (HTTP_STATUS_CODE.SYSPERF_SUCCESS && res.data.hpc.data) {
                    res.data.hpc.data.map((item: any) => {
                        if (item.core_type === 'core') {
                            coreData.push(item);
                        }
                        if (item.core_type === 'uncore') {
                            uncoreData.push(item);
                        }
                    });
                }
                resolve({ coreData, uncoreData });
            });
        });
    }
}
