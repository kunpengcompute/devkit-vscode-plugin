import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { VscodeService } from 'projects/sys/src-ide/app/service/vscode.service';
/**
 * http 状态码枚举
 */
export const enum HTTP_STATUS_CODE {
    SYSPERF_SUCCESS = 'SysPerf.Success',
}

@Component({
    selector: 'app-ram-and-instruction',
    templateUrl: './ram-and-instruction.component.html',
    styleUrls: ['./ram-and-instruction.component.scss']
})
export class RamAndInstructionComponent implements OnInit {
    @Input() nodeId;
    @Input() taskId;
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }
    public i18n: any;
    public ramLeft = [];
    public ramRight = [];
    public instructionLeft = [];
    public instructionRight = [];
    public isHaveInstruct = false;
    /**
     * 初始化
     */
    ngOnInit() {
        const url = `/tasks/${this.taskId}/hpc-analysis/basicinfo/?node-id=${this.nodeId}&query-type=summary`;
        this.vscodeService.get({ url }, (res) => {
            if (res.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                this.ramLeft = [
                    {
                        label: this.i18n.mission_modal.hpc.ram.aver,
                        value: res.data.hpc.data['Average DRAM Bandwidth'] || '--',
                        indentation: false
                    },
                    {
                        label: this.i18n.mission_modal.hpc.ram.read,
                        value: res.data.hpc.data.Read || '--',
                        indentation: true
                    },
                    {
                        label: this.i18n.mission_modal.hpc.ram.write,
                        value: res.data.hpc.data.Write || '--',
                        indentation: true
                    },
                    {
                        label: this.i18n.mission_modal.hpc.ram.insideSocket,
                        value: res.data.hpc.data['Within Socket Bandwidth'] || '--',
                        indentation: false
                    },
                    {
                        label: this.i18n.mission_modal.hpc.ram.crossSocket,
                        value: res.data.hpc.data['Inter Socket Bandwidth'] || '--',
                        indentation: false
                    },
                ];
                this.ramRight = [
                    {
                        label: this.i18n.mission_modal.hpc.ram.ratio,
                        value: res.data.hpc.data['L3 By-Pass ratio'] || '--',
                        indentation: false
                    },
                    {
                        label: this.i18n.mission_modal.hpc.ram.miss_ratio,
                        value: res.data.hpc.data['L3 miss ratio'] || '--',
                        indentation: false
                    },
                    {
                        label: this.i18n.mission_modal.hpc.ram.use_ratio,
                        value: res.data.hpc.data['L3 Utilization Efficiency'] || '--',
                        indentation: false
                    },
                ];
                this.instructionLeft = [
                    {
                        label: this.i18n.mission_modal.hpc.instruction.memory,
                        value: res.data.hpc.data.Memory,
                        indentation: false,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.memory,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.load,
                        indentation: true,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.load,
                        value: res.data.hpc.data.Load
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.store,
                        indentation: true,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.store,
                        value: res.data.hpc.data.Store
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.integer,
                        value: res.data.hpc.data.Integer,
                        indentation: false,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.integer,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.float,
                        value: res.data.hpc.data['Floating Point'],
                        indentation: false,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.float,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.advanced,
                        value: res.data.hpc.data['Advanced SIMD'],
                        indentation: false,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.advanced,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.crypto,
                        value: res.data.hpc.data.Crypto,
                        indentation: false,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.crypto,
                    },
                ];
                this.instructionRight = [
                    {
                        label: this.i18n.mission_modal.hpc.instruction.branches,
                        value: res.data.hpc.data.Branches || res.data.hpc.data.Branch,
                        indentation: false,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.branches,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.immediate,
                        indentation: true,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.immediate,
                        value: res.data.hpc.data.Immediate
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.indirect,
                        indentation: true,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.indirect,
                        value: res.data.hpc.data.Indirect
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.return,
                        value: res.data.hpc.data.Return,
                        indentation: true,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.return,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.barriers,
                        value: res.data.hpc.data.Barriers,
                        indentation: false,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.barriers,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.instruct,
                        value: res.data.hpc.data['Instruction Synchronization'],
                        indentation: true,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.instructions,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.dataSyn,
                        value: res.data.hpc.data['Data Synchronization'],
                        indentation: true,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.data,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.datamem,
                        value: res.data.hpc.data['Data Memory'],
                        indentation: true,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.data_mem,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.notr,
                        value: res.data.hpc.data['Not Retired'],
                        indentation: false,
                        tips: this.i18n.mission_modal.hpc.instruction.tips.not,
                    },
                    {
                        label: this.i18n.mission_modal.hpc.instruction.other,
                        value: res.data.hpc.data.Other,
                        indentation: false
                    }
                ];
                this.getObeject();
            }
        });
    }
    /**
     * 判断指令分布有无数据
     */
    getObeject() {
        this.instructionLeft.map(item => {
            if (item.value) {
                this.isHaveInstruct = true;
            }
        });
    }
}
