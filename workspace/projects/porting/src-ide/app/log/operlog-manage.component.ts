import { VscodeService } from '../service/vscode.service';
import { I18nService } from '../service/i18n.service';
import { MessageService } from '../service/message.service';
const VSSTATUS = '1';
export class OperLogManageComponent {
    public static instance: OperLogManageComponent;

    // 静态实例常量
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private msgService: MessageService
    ) {
        OperLogManageComponent.instance = this;
    }

    /**
     * port操作日志详细列表
     * @param operLogList 操作日志列表
     */
    public downloadInfo(operLogList: any) {
        const logList = this.formateDataToCSV(operLogList);
        const reportParams = {
            data: logList,
            reportId: 'log',
            status: VSSTATUS
        };

        const option = {
            cmd: 'downloadLog',
            data: reportParams
        };
        this.vscodeService.postMessage(option, null);
    }

    /**
     * 格式化操作日志列表
     * @param operLogList 操作日志列表
     */
    formateDataToCSV(operLogList: any) {
        let rowData = 'User Name,	Event,	Result,	Time,	Details\r\n';
        operLogList.data.forEach((item: any, index: any) => {
            rowData += item.username + ',' + item.event + ',' + item.result + ','
             + item.time + '\t' + ',' + '"' + item.detail + '"' + '\r\n';
        });
        const CSV = rowData;
        return CSV;
    }


    /**
     * 操作日志状态
     * @param status 状态
     */
    public statusFormat(status: string): string {
        let statusClass = 'success-icon';
        switch (status) {
            case 'Successful':
                statusClass = 'success-icon';
                break;
            case 'Failed':
                statusClass = 'failed-icon';
                break;
            case 'Timeout':
                statusClass = 'timeout-icon';
                break;
            default:
                statusClass = 'success-icon';
        }
        return statusClass;
    }
}
