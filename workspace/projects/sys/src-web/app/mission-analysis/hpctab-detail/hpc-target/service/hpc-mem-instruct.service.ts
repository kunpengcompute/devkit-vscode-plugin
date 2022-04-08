import { Injectable } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { IHpcMemInstruct } from '../../domain';

@Injectable({
  providedIn: 'root'
})
export class HpcMemInstructService {

  private i18n: any;

  constructor(
    private http: AxiosService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  getTargetData(taskid: number, nodeid: number)
    : Promise<{
      targetData: Array<IHpcMemInstruct>,
      instructData: Array<IHpcMemInstruct>
    }> {

    const params = {
      'node-id': nodeid,
      'query-type': 'summary'
    };

    return new Promise<any>((resolve, reject) => {
      this.http.axios.get(
        `/tasks/${encodeURIComponent(taskid)}/hpc-analysis/basicinfo/`,
        { params, headers: { showLoading: false } }
      ).then((res: any) => {

        let targetData: Array<IHpcMemInstruct> = [];
        let instructData: Array<IHpcMemInstruct> = [];

        if (res?.data?.hpc?.data) {
          targetData = [
            {
              content: [
                {
                  title: this.i18n.hpc.hpc_target.ava_bandwith,
                  key: res.data.hpc.data['Average DRAM Bandwidth'] || '--',
                  content: [
                    {
                      title: this.i18n.hpc.hpc_target.read_bandwith,
                      key: res.data.hpc.data.Read || '--'
                    },
                    {
                      title: this.i18n.hpc.hpc_target.write_bandwith,
                      key: res.data.hpc.data.Write || '--'
                    },
                  ]
                },
                {
                  title: this.i18n.hpc.hpc_target.inner_socket_bandwith,
                  key: res.data.hpc.data['Within Socket Bandwidth'] || '--'
                },
                {
                  title: this.i18n.hpc.hpc_target.out_socket_bandwith,
                  key: res.data.hpc.data['Inter Socket Bandwidth'] || '--'
                },
              ]
            },
            {
              content: [
                {
                  title: this.i18n.hpc.hpc_target.l3_rate,
                  key: res.data.hpc.data['L3 By-Pass ratio'] || '--'
                },
                {
                  title: this.i18n.hpc.hpc_target.l3_missing,
                  key: res.data.hpc.data['L3 miss ratio'] || '--'
                },
                {
                  title: this.i18n.hpc.hpc_target.l3_use,
                  key: res.data.hpc.data['L3 Utilization Efficiency'] || '--'
                },
              ]
            }
          ];
          instructData = [
            {
              content: [
                {
                  title: this.i18n.hpc.hpc_target.memory,
                  key: res.data.hpc.data.Memory,
                  src: './assets/img/header/svg/help.svg',
                  tip: this.i18n.hpc.tips.memory,
                  content: [
                    {
                      title: this.i18n.hpc.hpc_target.load,
                      src: './assets/img/header/svg/help.svg',
                      tip: this.i18n.hpc.tips.load,
                      key: res.data.hpc.data.Load
                    },
                    {
                      title: this.i18n.hpc.hpc_target.store,
                      src: './assets/img/header/svg/help.svg',
                      tip: this.i18n.hpc.tips.store,
                      key: res.data.hpc.data.Store
                    },
                  ]
                },
                {
                  title: this.i18n.hpc.hpc_target.integer,
                  key: res.data.hpc.data.Integer,
                  src: './assets/img/header/svg/help.svg',
                  tip: this.i18n.hpc.tips.integer,
                },
                {
                  title: this.i18n.hpc.hpc_target.float,
                  key: res.data.hpc.data['Floating Point'],
                  src: './assets/img/header/svg/help.svg',
                  tip: this.i18n.hpc.tips.float,
                },
                {
                  title: this.i18n.hpc.hpc_target.advanced,
                  key: res.data.hpc.data['Advanced SIMD'],
                  src: './assets/img/header/svg/help.svg',
                  tip: this.i18n.hpc.tips.advanced,
                },
                {
                  title: this.i18n.hpc.hpc_target.crypto,
                  key: res.data.hpc.data.Crypto,
                  src: './assets/img/header/svg/help.svg',
                  tip: this.i18n.hpc.tips.crypto,
                },
              ]
            },
            {
              content: [
                {
                  title: this.i18n.hpc.hpc_target.branch,
                  key: res.data.hpc.data.Branches || res.data.hpc.data.Branch,
                  src: './assets/img/header/svg/help.svg',
                  tip: this.i18n.hpc.tips.branches,
                  content: [
                    {
                      title: this.i18n.hpc.hpc_target.immediate,
                      src: './assets/img/header/svg/help.svg',
                      tip: this.i18n.hpc.tips.immediate,
                      key: res.data.hpc.data.Immediate
                    },
                    {
                      title: this.i18n.hpc.hpc_target.indirect,
                      src: './assets/img/header/svg/help.svg',
                      tip: this.i18n.hpc.tips.indirect,
                      key: res.data.hpc.data.Indirect
                    },
                    {
                      title: this.i18n.hpc.hpc_target.return,
                      key: res.data.hpc.data.Return,
                      src: './assets/img/header/svg/help.svg',
                      tip: this.i18n.hpc.tips.return,
                    }
                  ]
                },
                {
                  title: this.i18n.hpc.hpc_target.barries,
                  key: res.data.hpc.data.Barriers,
                  src: './assets/img/header/svg/help.svg',
                  tip: this.i18n.hpc.tips.barriser,
                  content: [
                    {
                      title: this.i18n.hpc.hpc_target.instruct,
                      key: res.data.hpc.data['Instruction Synchronization'],
                      src: './assets/img/header/svg/help.svg',
                      tip: this.i18n.hpc.tips.instructions,
                    },
                    {
                      title: this.i18n.hpc.hpc_target.dataSyn,
                      key: res.data.hpc.data['Data Synchronization'],
                      src: './assets/img/header/svg/help.svg',
                      tip: this.i18n.hpc.tips.data,
                    },
                    {
                      title: this.i18n.hpc.hpc_target.datamem,
                      key: res.data.hpc.data['Data Memory'],
                      src: './assets/img/header/svg/help.svg',
                      tip: this.i18n.hpc.tips.data_mem,
                    }
                  ]
                },
                {
                  title: this.i18n.hpc.hpc_target.notr,
                  key: res.data.hpc.data['Not Retired'],
                  src: './assets/img/header/svg/help.svg',
                  tip: this.i18n.hpc.tips.not,
                },
                {
                  title: this.i18n.hpc.hpc_target.other,
                  key: res.data.hpc.data.Other,
                  src: './assets/img/header/svg/help.svg'
                }
              ]
            }
          ];
        }

        resolve({ targetData, instructData });
      });
    });
  }
}
