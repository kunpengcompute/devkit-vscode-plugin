import { AnalysisScene } from 'projects/sys/src-web/app/domain';

/**
 * 分析场景:
 *   通用场景： 11
 *   分布式场景：[1, 10] U [12, 100]
 *   大数据场景：[101, 200]
 *   HPC 场景：[201, 400)
 *   数据库场景：[401, +∞]
 *
 * @param id 场景id
 * @returns 分析场景
 */
export function judgeScene(id: number): AnalysisScene {
    switch (true) {
        case id === 11:
            return AnalysisScene.General;
        case id >= 1 && id <= 100:
            return AnalysisScene.Distribute;
        case id >= 101 && id <= 200:
            return AnalysisScene.BigData;
        case id >= 201 && id <= 400:
            return AnalysisScene.Hpc;
        case id >= 401:
            return AnalysisScene.Database;
        default:
            throw new Error(`Analysis scene judgement failed due to incorrect scene ID: ${id}`);
    }
}
