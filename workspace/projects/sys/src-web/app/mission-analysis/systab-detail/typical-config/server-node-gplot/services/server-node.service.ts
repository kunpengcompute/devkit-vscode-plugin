import { Injectable } from '@angular/core';
import { ServerNodeComponent } from '../components/server-node/server-node.component';
import { GplotType, GplotNode, GplotNodeData, GplotNodeTypeEnum, AnalysisScenarioEnum } from '../classes/reference';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';

@Injectable({
  providedIn: 'root'
})
export class ServerNodeService {

  /**
   * 后端接口数据, topology_type的值有：
   *   big_data_topology——大数据，有拓扑;
   *   big_data_no_topology——大数据，无拓扑；
   *   scene_data_no_topology——分布式，无拓扑；
   */
  private responseData: {
    topology_type: 'big_data_topology' | 'big_data_no_topology' | 'scene_data_no_topology',
    node_list: { [key: string]: GplotNodeData },
  };

  public gplotType: GplotType | null;

  public allnodeDataList: GplotNodeData[];
  public nameNodeDataList: GplotNodeData[];
  public dataNodeDataList: GplotNodeData[];

  constructor(
    public axiosService: AxiosService
  ) { }

  /**
   * 获取拓扑图的类型
   * @param taskId 任务ID
   * @param nodeId 节点ID
   */
  public async getGplotType(taskId: number, nodeId: number): Promise<GplotType | null> {
    try {
      await this.requestGplotRawData(taskId, nodeId);
    } catch (error) {
      console.error(error);
      return null;
    }
    return this.gplotType;
  }

  /**
   * 获取具名节点列表
   */
  public getNameNodeList(): GplotNode[] {
    return this.nameNodeDataList.map((item: GplotNodeData) => {
      return new GplotNode(ServerNodeComponent, item);
    });
  }

  /**
   * 获取数据节点列表
   */
  public getDataNodeList(): GplotNode[] {
    return this.dataNodeDataList.map((item: GplotNodeData) => {
      return new GplotNode(ServerNodeComponent, item);
    });
  }

  /**
   * 获取所有节点列表
   */
  public getAllNodeList(): GplotNode[] {
    return this.allnodeDataList.map((item: GplotNodeData) => {
      return new GplotNode(ServerNodeComponent, item);
    });
  }

  /**
   * 请求并处理接口数据
   * @param taskId 任务ID
   * @param nodeId 节点ID
   */
  private requestGplotRawData(taskId: number, nodeId: number) {
    // 当数据请求有误是的处理逻辑, 当返回值为 null 时，请求数据有误(数据结构，数据参数)
    return new Promise<void>((resolve, reject) => {
      this.axiosService.axios.get('tasks/' + encodeURIComponent(taskId) + '/sys-performance/node-detail/?nodeId='
      + encodeURIComponent(nodeId) + '&queryType=node-detail&queryTarget=', { headers: {
        showLoading: false,
      }})
        .then((res: any) => {
          this.responseData = res.data;
          const rawType = this.responseData.topology_type;
          // 所有节点的数据
          this.allnodeDataList = Object.values(this.responseData.node_list);
          // 具名节点的数据
          this.nameNodeDataList = Object.values(this.responseData.node_list)
            .filter(item => item.NODE_TYPE && item.NODE_TYPE === GplotNodeTypeEnum.NAMENODE);
          // 数据节点的数据
          this.dataNodeDataList = Object.values(this.responseData.node_list)
            .filter(item => item.NODE_TYPE && item.NODE_TYPE === GplotNodeTypeEnum.DATANODE);
          // 为空判断
          if (rawType == null || this.allnodeDataList == null || this.allnodeDataList.length === 0) {
            this.gplotType = null;
            resolve();
            return;
          }

          // 拓扑类型判断
          if (rawType === 'big_data_topology') {
            this.gplotType = { type: AnalysisScenarioEnum.BIG_DATA, hasTopolopy: true };
            switch (true) {
              case this.allnodeDataList.length < 2:
              case this.nameNodeDataList.length === 0:
              case this.dataNodeDataList.length === 0:
                this.gplotType.hasTopolopy = false;
            }
          } else if (rawType === 'big_data_no_topology') {
            this.gplotType = { type: AnalysisScenarioEnum.BIG_DATA, hasTopolopy: false };
          } else if (rawType === 'scene_data_no_topology') {
            this.gplotType = { type: AnalysisScenarioEnum.SCENE_DATA, hasTopolopy: false };
          } else {
            this.gplotType = null;
          }
          resolve();
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
}
